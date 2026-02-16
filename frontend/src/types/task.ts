import { z } from 'zod';

// Zod schema for Task validation
const TaskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  due_date: z.string().datetime().optional().nullable(),
  completed_at: z.string().datetime().optional().nullable(),
  user_id: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Zod schema for creating a task
const TaskCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  due_date: z.string().datetime().optional().nullable(),
});

// Zod schema for updating a task
const TaskUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters").optional(),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  due_date: z.string().datetime().optional().nullable(),
  completed_at: z.string().datetime().optional().nullable(),
});

export type Task = z.infer<typeof TaskSchema>;
export type TaskCreate = z.infer<typeof TaskCreateSchema>;
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;

export {
  TaskSchema,
  TaskCreateSchema,
  TaskUpdateSchema
};