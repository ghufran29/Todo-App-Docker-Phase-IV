import { ChatResponse, Conversation, ChatMessage } from '../types/chat';
import { apiClient } from './api_client';

class ChatService {
  /**
   * Send a message to the AI agent via POST /api/{userId}/chat
   */
  static async sendMessage(
    userId: string,
    message: string,
    conversationId?: string
  ): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>(
      `/api/${userId}/chat`,
      { message, conversation_id: conversationId || null },
      { timeout: 120000 } // 2 min timeout for AI agent + MCP tool calls
    );
    return response.data;
  }

  /**
   * List all conversations for the authenticated user via GET /api/conversations
   */
  static async listConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<{ conversations: Conversation[]; count: number }>(
      '/api/conversations'
    );
    return response.data.conversations;
  }

  /**
   * Get message history for a specific conversation via GET /api/conversations/{id}/messages
   */
  static async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const response = await apiClient.get<{ messages: ChatMessage[]; count: number }>(
      `/api/conversations/${conversationId}/messages`
    );
    return response.data.messages;
  }

  /**
   * Delete a conversation and all its messages via DELETE /api/conversations/{id}
   */
  static async deleteConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`/api/conversations/${conversationId}`);
  }
}

export default ChatService;
