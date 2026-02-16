'use client';

import React, { useState } from 'react';
import { Task } from '../../types/task';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityColors: Record<string, string> = {
  urgent: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-green-500',
};

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

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>(task.priority || 'medium');
  const [dueDate, setDueDate] = useState(task.due_date || '');

  const handleSave = () => {
    onUpdate({ ...task, title, description: desc, priority: priority as any, due_date: dueDate || null });
    setEditing(false);
  };

  const handleCancel = () => {
    setTitle(task.title); setDesc(task.description || '');
    setPriority(task.priority || 'medium'); setDueDate(task.due_date || '');
    setEditing(false);
  };

  return (
    <div className={`group rounded-xl border border-border bg-card border-l-4 ${priorityColors[task.priority || 'medium']} transition-colors hover:border-primary/20 ${
      task.status === 'completed' ? 'opacity-60' : ''
    }`}>
      {editing ? (
        <div className="p-4 space-y-3 animate-scale-in">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2}
            className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <div className="grid grid-cols-2 gap-2">
            <select value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
              className="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="low">Low</option><option value="medium">Medium</option>
              <option value="high">High</option><option value="urgent">Urgent</option>
            </select>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="gradient-bg text-white px-4 py-2 rounded-lg text-sm font-medium">Save</button>
            <button onClick={handleCancel} className="bg-muted text-muted-foreground px-4 py-2 rounded-lg text-sm font-medium">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => onToggleComplete(task)}
              className={`mt-0.5 flex-shrink-0 w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-colors ${
                task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-border hover:border-primary'
              }`}
            >
              {task.status === 'completed' && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.title}
                </h3>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusBadge[task.status || 'pending']}`}>
                    {task.status?.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${priorityBadge[task.priority || 'medium']}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
              )}
              {task.due_date && (
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button onClick={() => setEditing(true)} className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Edit">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button onClick={() => task.id && onDelete(task.id)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
