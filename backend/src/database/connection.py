from sqlmodel import create_engine, Session, SQLModel
from sqlalchemy.pool import QueuePool, StaticPool
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Fix potential issue where DATABASE_URL might start with postgres:// (common in some environments)
# SQLAlchemy requires postgresql://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Ensure sslmode=require for Neon/PostgreSQL if not present
if DATABASE_URL and "postgresql" in DATABASE_URL and "sslmode=" not in DATABASE_URL:
    if "?" in DATABASE_URL:
        DATABASE_URL += "&sslmode=require"
    else:
        DATABASE_URL += "?sslmode=require"

# Try PostgreSQL first, fallback to SQLite for local testing
if DATABASE_URL and (DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgresql+")):
    try:
        # Create engine with connection pooling optimized for PostgreSQL/Neon
        engine = create_engine(
            DATABASE_URL,
            poolclass=QueuePool,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=False
        )
        print("Using PostgreSQL database")
    except Exception as e:
        print(f"PostgreSQL connection failed: {e}")
        print("Falling back to SQLite...")
        DATABASE_URL = "sqlite:///./todo_app.db"
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=False
        )
else:
    # Use SQLite for local development
    if DATABASE_URL:
        print(f"DATABASE_URL provided but does not start with postgresql://: {DATABASE_URL[:10]}...")
    print("Using SQLite database for local development")
    DATABASE_URL = "sqlite:///./todo_app.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False
    )

def get_session():
    """Yield a database session for use with dependency injection."""
    with Session(engine) as session:
        yield session

# Function to create tables (to be called during app startup)
def create_db_and_tables():
    """Create all database tables based on SQLModel models."""
    from src.models.user import User
    from src.models.task import Task
    from src.models.conversation import Conversation
    from src.models.message import Message

    print("Creating database tables...")
    SQLModel.metadata.create_all(engine)
    print("Database tables created successfully")