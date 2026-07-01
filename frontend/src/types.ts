export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

export interface TaskFilters {
  status: string;
  priority: string;
  search: string;
  sortBy: string;
  order: 'asc' | 'desc';
  dueRange: string;
}

export interface TaskStatsSummary {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  highPriority: number;
}

export type ToastType = 'success' | 'error' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}
