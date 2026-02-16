from mcp.server.fastmcp import FastMCP

# Initialize the MCP server instance
# streamable_http_path="/" so when mounted at "/mcp" the final URL is "/mcp"
mcp = FastMCP("todo-task-tools", streamable_http_path="/")
