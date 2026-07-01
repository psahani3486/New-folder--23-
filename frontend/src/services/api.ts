import type { Task, TaskFormData, TaskFilters } from '../types';

// Read VITE_API_URL or default to localhost:5000
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

// Utility helper to handle HTTP responses and throw friendly errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! Status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // JSON parsing failed, use generic message
    }
    throw new Error(errorMessage);
  }
  
  // Return empty object for empty responses or delete confirmation, else parse JSON
  if (response.status === 204) {
    return {};
  }
  return response.json();
};

export const api = {
  // GET /api/tasks (with filters and sorting)
  async getTasks(filters: TaskFilters): Promise<Task[]> {
    const query = new URLSearchParams();
    
    if (filters.status) query.append('status', filters.status);
    if (filters.priority) query.append('priority', filters.priority);
    if (filters.search) query.append('search', filters.search);
    if (filters.sortBy) query.append('sortBy', filters.sortBy);
    if (filters.order) query.append('order', filters.order);
    if (filters.dueRange) query.append('dueRange', filters.dueRange);

    const response = await fetch(`${BASE_URL}/tasks?${query.toString()}`);
    return handleResponse(response);
  },

  // GET /api/tasks/:id
  async getTask(id: string): Promise<Task> {
    const response = await fetch(`${BASE_URL}/tasks/${id}`);
    return handleResponse(response);
  },

  // POST /api/tasks
  async createTask(taskData: TaskFormData): Promise<Task> {
    const payload = {
      ...taskData,
      // Format empty date to null
      dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
    };

    const response = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  // PUT /api/tasks/:id
  async updateTask(id: string, taskData: Partial<TaskFormData>): Promise<Task> {
    const payload = {
      ...taskData,
      dueDate: taskData.dueDate !== undefined 
        ? (taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null)
        : undefined
    };

    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  // DELETE /api/tasks/:id
  async deleteTask(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  }
};
