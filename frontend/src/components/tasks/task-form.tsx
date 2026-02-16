'use client';

import React, { useState } from 'react';
import { TaskCreate } from '../../types/task';
import { TaskSchema, TaskCreateSchema } from '../../types/task';
import TaskService from '../../services/task_service';

interface TaskFormProps {
  onTaskCreated: (task: TaskCreate) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }

    setLoading(true); setError(null);
    try {
      const taskData: any = { title: title.trim(), description: description.trim(), priority };
      if (dueDate) taskData.due_date = new Date(dueDate).toISOString();
      const newTask = await TaskService.createTask(taskData);
      setTitle(''); setDescription(''); setPriority('medium'); setDueDate('');
      onTaskCreated(newTask);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create task');
    } finally { setLoading(false); }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">New Task</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
            {error}
          </div>
        )}
        <input
          type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Task title *"
        />
        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
          className="w-full px-3.5 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Description (optional)"
        />
        <div className="grid grid-cols-2 gap-3">
          <select value={priority} onChange={(e) => setPriority(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="low">Low</option><option value="medium">Medium</option>
            <option value="high">High</option><option value="urgent">Urgent</option>
          </select>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={loading}
            className="gradient-bg text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2">
            {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? 'Creating...' : 'Create Task'}
          </button>
          <button type="button" onClick={onCancel}
            className="bg-muted text-muted-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
