// Chat type definitions for the Chat API Frontend (Spec 3)

export interface ToolCall {
  tool: string;
  arguments: Record<string, unknown>;
  result: unknown;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tool_calls: ToolCall[];
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatResponse {
  conversation_id: string;
  response_text: string;
  tool_calls: ToolCall[];
}
