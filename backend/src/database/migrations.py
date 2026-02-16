from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# Revision identifiers for Alembic
revision = '001_initial_database_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade the database schema to the current version."""
    # Create users table
    op.create_table(
        'user',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('email_verified', sa.Boolean(), nullable=False, default=False),
        sa.Column('role', sa.String(length=50), nullable=False, default='user'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    # Create indexes
    op.create_index('ix_user_email', 'user', ['email'])
    op.create_index('ix_user_created_at', 'user', ['created_at'])

    # Create tasks table
    op.create_table(
        'task',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, default='pending'),
        sa.Column('priority', sa.String(length=50), nullable=False, default='medium'),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for tasks
    op.create_index('ix_task_user_id', 'task', ['user_id'])
    op.create_index('ix_task_status', 'task', ['status'])
    op.create_index('ix_task_due_date', 'task', ['due_date'])
    op.create_index('ix_task_priority', 'task', ['priority'])


def downgrade() -> None:
    """Downgrade the database schema to the previous version."""
    # Drop indexes first
    op.drop_index('ix_task_priority')
    op.drop_index('ix_task_due_date')
    op.drop_index('ix_task_status')
    op.drop_index('ix_task_user_id')
    op.drop_index('ix_user_created_at')
    op.drop_index('ix_user_email')

    # Drop tables
    op.drop_table('task')
    op.drop_table('user')