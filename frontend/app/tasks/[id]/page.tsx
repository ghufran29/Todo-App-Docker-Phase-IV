'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/src/components/auth/ProtectedRoute';
import TaskService from '@/src/services/task_service';
import { Task } from '@/src/types/task';

const priorityBadge: Record<string, string> = {
  urgent: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10',
  high: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10',
  medium: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-500/10',
  low: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10',
};

const statusBadge: Record<string, string> = {
  completed: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10',
  in_progress: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10',
  pending: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-500/10',
};

const priorityBorder: Record<string, string> = {
  urgent: 'border-l-red-500', high: 'border-l-orange-500',
  medium: 'border-l-yellow-500', low: 'border-l-green-500',
};

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => { fetchTask(); }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true); setError(null);
      const d = await TaskService.getTaskById(taskId);
      setTask(d); setTitle(d.title); setDesc(d.description || '');
      setPriority(d.priority || 'medium'); setDueDate(d.due_date || '');
    } catch (err: any) { setError(err.response?.data?.detail || 'Failed to load task'); }
    finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    if (!task?.id) return;
    try {
      const u = await TaskService.updateTask(task.id, { title, description: desc, priority, due_date: dueDate || null });
      setTask(u); setEditing(false);
    } catch (err: any) { setError(err.response?.data?.detail || 'Failed to update task'); }
  };

  const handleToggle = async () => {
    if (!task?.id) return;
    try { setTask(await TaskService.updateTaskCompletion(task.id, task.status !== 'completed')); }
    catch (err: any) { setError('Failed to update task status'); }
  };

  const handleDelete = async () => {
    if (!task?.id || !confirm('Delete this task?')) return;
    try { await TaskService.deleteTask(task.id); router.push('/tasks'); }
    catch (err: any) { setError('Failed to delete task'); }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!task) {
    return (
      <ProtectedRoute>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error || 'Task not found'}</p>
          </div>
          <button onClick={() => router.push('/tasks')} className="text-sm text-primary hover:underline mt-4">
            Back to tasks
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => router.push('/tasks')} className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to tasks
        </button>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 mb-4 text-sm text-destructive animate-scale-in">
            {error}
          </div>
        )}

        <div className={`rounded-xl border border-border bg-card border-l-4 ${priorityBorder[task.priority || 'medium']} animate-fade-in`}>
          <div className="p-6">
            {editing ? (
              <div className="space-y-4 animate-scale-in">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                  <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Priority</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="low">Low</option><option value="medium">Medium</option>
                      <option value="high">High</option><option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Due Date</label>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleUpdate} className="gradient-bg text-white px-5 py-2 rounded-lg text-sm font-medium">Save</button>
                  <button onClick={() => { setTitle(task.title); setDesc(task.description || ''); setPriority(task.priority || 'medium'); setDueDate(task.due_date || ''); setEditing(false); }}
                    className="bg-muted text-muted-foreground px-5 py-2 rounded-lg text-sm font-medium">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h1 className={`text-xl font-bold ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </h1>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${statusBadge[task.status || 'pending']}`}>
                      {task.status?.replace('_', ' ')}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${priorityBadge[task.priority || 'medium']}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                {task.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{task.description}</p>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-6">
                  {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                  {task.created_at && <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>}
                  {task.updated_at && <span>Updated: {new Date(task.updated_at).toLocaleDateString()}</span>}
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  <button onClick={handleToggle}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      task.status === 'completed'
                        ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-500/10 dark:text-yellow-400'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400'
                    }`}>
                    {task.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                  </button>
                  <button onClick={() => setEditing(true)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    Edit
                  </button>
                  <button onClick={handleDelete}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
