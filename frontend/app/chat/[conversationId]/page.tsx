'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ChatInterface from '../../../src/components/chat/ChatInterface';
import ChatService from '../../../src/services/chat_service';
import { ChatMessage } from '../../../src/types/chat';

export default function ConversationDetailPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const data = await ChatService.getMessages(conversationId);
        setMessages(data);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    };
    if (conversationId) loadMessages();
  }, [conversationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center animate-fade-in">
          <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return <ChatInterface conversationId={conversationId} initialMessages={messages} />;
}
