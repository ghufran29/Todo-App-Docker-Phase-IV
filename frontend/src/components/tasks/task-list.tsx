'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '../../types/task';
import TaskItem from './task-item';
import TaskForm from './task-form';
import { apiClient } from '../../services/api_client';
import { useAuth } from '../../hooks/useAuth';

interface TaskListProps {
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ onTaskUpdate, onTaskDelete }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const { currentUser } = useAuth();

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true); setError(null);
      const response = await apiClient.get('/api/tasks');
      setTasks(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) setTasks([]);
      else setError(err.response?.data?.detail || 'Failed to load tasks');
    } finally { setLoading(false); }
  };

  const handleTaskCreated = (newTask: any) => {
    setTasks(prev => [newTask, ...prev]);
    setShowForm(false);
  };

  const handleTaskUpdated = async (updatedTask: Task) => {
    try {
      if (updatedTask.id) {
        const response = await apiClient.updateTask(updatedTask.id, {
          title: updatedTask.title, description: updatedTask.description,
          status: updatedTask.status, priority: updatedTask.priority, due_date: updatedTask.due_date
        });
        setTasks(prev => prev.map(task => task.id === response.id ? response : task));
        if (onTaskUpdate) onTaskUpdate(response);
      }
    } catch (err) { setError('Failed to save task changes'); }
  };

  const handleTaskDeleted = async (taskId: string) => {
    try {
      await apiClient.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      if (onTaskDelete) onTaskDelete(taskId);
    } catch (err) { setError('Failed to delete task'); }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      if (!task.id) return;
      const response = await apiClient.completeTask(task.id, task.status !== 'completed');
      handleTaskUpdated(response);
    } catch (err) { setError('Failed to update task status'); }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your Tasks</h1>
          <p className="text-sm text-muted-foreground">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showForm
              ? 'bg-muted text-muted-foreground hover:bg-muted/80'
              : 'gradient-bg text-white'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
          </svg>
          {showForm ? 'Cancel' : 'New Task'}
        </button>
      </div>

      {error && (
        <div className="animate-scale-in rounded-lg bg-destructive/10 border border-destructive/20 p-3 mb-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 animate-scale-in">
          <TaskForm onTaskCreated={handleTaskCreated} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <svg className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-foreground font-medium mb-1">No tasks yet</p>
          <p className="text-sm text-muted-foreground">Create your first task to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggleComplete={handleToggleComplete} onUpdate={handleTaskUpdated} onDelete={handleTaskDeleted} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
