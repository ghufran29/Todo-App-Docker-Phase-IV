import { Task, TaskCreate, TaskUpdate } from '../types/task';
import { apiClient } from './api_client';

class TaskService {
  /**
   * Get all tasks for the current user
   * @returns Promise resolving to array of Task objects
   */
  static async getTasks(): Promise<Task[]> {
    try {
      const response = await apiClient.get('/api/tasks');
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Get a specific task by ID
   * @param taskId - The ID of the task to retrieve
   * @returns Promise resolving to Task object
   */
  static async getTaskById(taskId: string): Promise<Task> {
    try {
      const response = await apiClient.get(`/api/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching task with ID ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new task
   * @param taskData - Task creation data
   * @returns Promise resolving to created Task object
   */
  static async createTask(taskData: TaskCreate): Promise<Task> {
    try {
      const response = await apiClient.post('/api/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update an existing task
   * @param taskId - The ID of the task to update
   * @param taskData - Task update data
   * @returns Promise resolving to updated Task object
   */
  static async updateTask(taskId: string, taskData: TaskUpdate): Promise<Task> {
    try {
      const response = await apiClient.put(`/api/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error(`Error updating task with ID ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a task
   * @param taskId - The ID of the task to delete
   * @returns Promise resolving when task is deleted
   */
  static async deleteTask(taskId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/tasks/${taskId}`);
    } catch (error) {
      console.error(`Error deleting task with ID ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Mark a task as completed or uncompleted
   * @param taskId - The ID of the task to update completion status
   * @param completed - Whether the task is completed or not
   * @returns Promise resolving to updated Task object
   */
  static async updateTaskCompletion(taskId: string, completed: boolean): Promise<Task> {
    try {
      // Explicitly convert boolean to string for query parameter
      const response = await apiClient.patch(`/api/tasks/${taskId}/complete?completed=${String(completed)}`);
      return response.data;
    } catch (error) {
      console.error(`Error updating task completion status for ID ${taskId}:`, error);
      throw error;
    }
  }
}

export default TaskService;