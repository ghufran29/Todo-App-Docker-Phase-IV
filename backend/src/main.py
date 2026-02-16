from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.task_router import router as task_router
from src.api.auth_router import router as auth_router
from src.api.user_router import router as user_router
from src.api.chat_router import router as chat_router
from src.database.connection import create_db_and_tables
from src.mcp.app import mcp as mcp_server
import uvicorn


def create_app() -> FastAPI:
    # Pre-create the MCP streamable HTTP app so we can manage its lifecycle
    mcp_app = mcp_server.streamable_http_app()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        create_db_and_tables()
        # Start MCP session manager lifecycle
        async with mcp_server.session_manager.run():
            yield

    app = FastAPI(
        title="Todo App - Database API",
        description="API for user and task management with Neon PostgreSQL",
        version="1.0.0",
        lifespan=lifespan,
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,  # Set to False to allow "*" origins, which is most stable for JWT development
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(auth_router, prefix="/api")
    app.include_router(user_router, prefix="/api")
    app.include_router(task_router, prefix="/api")
    app.include_router(chat_router, prefix="/api")

    @app.get("/")
    def read_root():
        return {"message": "Todo App Database Service"}

    @app.get("/health")
    def health_check():
        return {"status": "healthy"}

    # Mount MCP server at /mcp using streamable HTTP transport
    app.mount("/mcp", mcp_app)

    return app


app = create_app()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)