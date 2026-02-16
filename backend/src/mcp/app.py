"""MCP application entry point.

Imports tool modules to trigger @mcp.tool() registration,
then exposes the configured mcp instance.
"""
from src.mcp.server import mcp  # noqa: F401

# Import tool modules to register them with the mcp instance.
# Each module uses @mcp.tool() which registers at import time.
import src.mcp.tools.add_task        # noqa: F401
import src.mcp.tools.list_tasks      # noqa: F401
import src.mcp.tools.update_task     # noqa: F401
import src.mcp.tools.complete_task   # noqa: F401
import src.mcp.tools.delete_task     # noqa: F401
