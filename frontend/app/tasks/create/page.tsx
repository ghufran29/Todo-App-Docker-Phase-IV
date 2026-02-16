'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import TaskForm from '@/src/components/tasks/task-form';
import { ProtectedRoute } from '@/src/components/auth/ProtectedRoute';

export default function CreateTaskPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTaskCreated = () => {
    setShowSuccess(true);
    setTimeout(() => router.push('/tasks'), 1500);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-bold">
              <span className="gradient-text">Create New Task</span>
            </h1>
            <p className="text-muted-foreground mt-2">Add a new task to your list</p>
          </div>

          {showSuccess && (
            <div className="mb-6 animate-scale-in glass rounded-2xl p-4 border-green-500/20">
              <p className="text-sm text-green-500 font-medium">
                Task created successfully! Redirecting...
              </p>
            </div>
          )}

          <div className="animate-fade-in-up delay-100">
            <TaskForm onTaskCreated={handleTaskCreated} onCancel={() => router.push('/tasks')} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
