'use client';

import React from 'react';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute';
import ConversationList from '../../src/components/chat/ConversationList';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-[calc(100vh-3.5rem)]">
        <aside className="w-72 border-r border-border hidden md:flex flex-col flex-shrink-0">
          <ConversationList />
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
