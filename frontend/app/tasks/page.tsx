'use client';

import React from 'react';
import { ProtectedRoute } from '@/src/components/auth/ProtectedRoute';
import TaskList from '@/src/components/tasks/task-list';

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <TaskList />
    </ProtectedRoute>
  );
}
