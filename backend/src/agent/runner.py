import logging
from agents import Runner
from src.agent.config import create_agent, create_mcp_server, create_run_config

logger = logging.getLogger(__name__)


async def run_agent(
    user_id: str,
    messages: list[dict],
) -> tuple[str, list[dict]]:
    """Execute the AI agent with conversation history.

    Args:
        user_id: UUID string of the authenticated user
        messages: List of {"role": str, "content": str} dicts

    Returns:
        Tuple of (response_text, tool_calls_list)
    """
    async with create_mcp_server() as mcp_server:
        agent = create_agent(user_id, mcp_server)
        run_config = create_run_config()
        result = await Runner.run(agent, messages, run_config=run_config)

        # Extract tool calls from result.new_items
        tool_calls = []
        try:
            for item in result.new_items:
                item_type = type(item).__name__
                if item_type == "ToolCallItem":
                    raw = item.raw_item
                    tool_calls.append({
                        "tool": getattr(raw, "name", str(raw)),
                        "arguments": getattr(raw, "arguments", ""),
                    })
                elif item_type == "ToolCallOutputItem":
                    if tool_calls:
                        tool_calls[-1]["result"] = getattr(
                            item, "output", str(item)
                        )
        except Exception:
            pass  # Tool call extraction is best-effort

        response_text = str(result.final_output) if result.final_output else ""

        return response_text, tool_calls
