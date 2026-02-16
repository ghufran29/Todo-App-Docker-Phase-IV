'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ChatService from '../../services/chat_service';
import { Conversation } from '../../types/chat';

const ConversationList: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await ChatService.listConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [pathname]);

  const handleDelete = async (e: React.MouseEvent, convId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this conversation and all its messages?')) return;

    setDeletingId(convId);
    try {
      await ChatService.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (pathname === `/chat/${convId}`) {
        router.push('/chat');
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-sidebar-foreground">Chats</h2>
          <Link
            href="/chat"
            className="flex items-center gap-1.5 text-xs font-medium gradient-bg text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </Link>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2">
        {loading && conversations.length === 0 ? (
          <div className="px-3 space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse px-3 py-3 rounded-lg">
                <div className="h-3.5 bg-muted rounded w-3/4 mb-2" />
                <div className="h-2.5 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <svg className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-xs text-muted-foreground">No conversations yet</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">Start a new chat</p>
          </div>
        ) : (
          <div className="px-2 space-y-0.5">
            {conversations.map((conv) => {
              const isActive = pathname === `/chat/${conv.id}`;
              const isDeleting = deletingId === conv.id;
              return (
                <div
                  key={conv.id}
                  className={`group relative rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10'
                      : 'hover:bg-muted/50'
                  } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Link
                    href={`/chat/${conv.id}`}
                    className="block px-3 py-2.5"
                  >
                    <p className={`text-sm truncate pr-6 ${
                      isActive ? 'font-medium text-primary' : 'text-sidebar-foreground'
                    }`}>
                      {conv.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(conv.updated_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </Link>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete conversation"
                  >
                    {isDeleting ? (
                      <div className="w-3.5 h-3.5 border border-muted-foreground/50 border-t-muted-foreground rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
