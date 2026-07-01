import { useState, useEffect, useCallback } from 'react';
import type { Task, TaskFormData, TaskFilters, ToastMessage, ToastType } from './types';
import { api } from './services/api';
import { TaskStats } from './components/TaskStats';
import { TaskBoard } from './components/TaskBoard';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { Toast } from './components/Toast';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // View states
  const [activeView, setActiveView] = useState<'kanban' | 'list'>('kanban');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Filters State
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    priority: 'all',
    search: '',
    sortBy: 'createdAt',
    order: 'desc',
    dueRange: 'all',
  });

  // Search input state (decoupled for debouncing)
  const [searchInput, setSearchInput] = useState('');

  // Toast helper
  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = 'toast_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch Tasks
  const fetchTasks = useCallback(async (currentFilters: TaskFilters) => {
    setIsLoading(true);
    try {
      const data = await api.getTasks(currentFilters);
      setTasks(data);
    } catch (error: any) {
      addToast(error.message || 'Failed to load tasks', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Handle Search Input Debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  // Re-fetch tasks when filters change
  useEffect(() => {
    fetchTasks(filters);
  }, [filters, fetchTasks]);

  // CRUD: Create or Edit Task
  const handleSaveTask = async (formData: TaskFormData) => {
    try {
      if (taskToEdit) {
        const updatedTask = await api.updateTask(taskToEdit.id, formData);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskToEdit.id ? updatedTask : t))
        );
        addToast('Task updated successfully', 'success');
      } else {
        const newTask = await api.createTask(formData);
        setTasks((prev) => [newTask, ...prev]);
        addToast('Task created successfully', 'success');
      }
      setIsFormOpen(false);
      setTaskToEdit(null);
    } catch (error: any) {
      addToast(error.message || 'Failed to save task', 'error');
      throw error; // Propagate to keep form open/handle state
    }
  };

  // CRUD: Delete Task
  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await api.deleteTask(id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
        addToast('Task deleted successfully', 'success');
      } catch (error: any) {
        addToast(error.message || 'Failed to delete task', 'error');
      }
    }
  };

  // CRUD: Quick Status Transition
  const handleStatusChange = async (id: string, nextStatus: Task['status']) => {
    // Find task
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) return;

    const originalTask = tasks[taskIndex];
    
    // Optimistic Update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus, updatedAt: new Date().toISOString() } : t))
    );

    try {
      await api.updateTask(id, { status: nextStatus });
      addToast(`Task moved to ${nextStatus.replace('-', ' ')}`, 'success');
    } catch (error: any) {
      // Rollback on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? originalTask : t))
      );
      addToast(error.message || 'Failed to update task status', 'error');
    }
  };

  const handleEditClick = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const handleCreateClick = () => {
    setTaskToEdit(null);
    setIsFormOpen(true);
  };

  // Toggle sorting order
  const handleSortChange = (field: string) => {
    setFilters((prev) => {
      const isSameField = prev.sortBy === field;
      return {
        ...prev,
        sortBy: field,
        order: isSameField && prev.order === 'desc' ? 'asc' : 'desc',
      };
    });
  };

  return (
    <div className="app-container">
      {/* Toast Center */}
      <Toast toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <span style={{ fontSize: '2rem' }}>⚡</span>
          <div>
            <h1 className="brand-logo">TaskFlow</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Streamline your workflow in style
            </p>
          </div>
        </div>
        <div className="header-actions">
          <ThemeToggle />
          <button className="btn btn-primary" onClick={handleCreateClick}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Task
          </button>
        </div>
      </header>

      {/* Dashboard Stats */}
      <TaskStats tasks={tasks} />

      {/* Control Panel: Filters, Search, and View controls */}
      <section className="control-panel">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search tasks by title or details..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          
          <div className="view-toggles">
            <button
              className={`view-btn ${activeView === 'kanban' ? 'active' : ''}`}
              onClick={() => setActiveView('kanban')}
              title="Kanban Board View"
            >
              <span>📋</span> Kanban
            </button>
            <button
              className={`view-btn ${activeView === 'list' ? 'active' : ''}`}
              onClick={() => setActiveView('list')}
              title="List View"
            >
              <span>☰</span> List
            </button>
          </div>
        </div>

        <div className="filters-row">
          <div className="filters-group">
            {/* Filter: Status */}
            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              title="Filter by Status"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {/* Filter: Priority */}
            <select
              className="filter-select"
              value={filters.priority}
              onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
              title="Filter by Priority"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            {/* Filter: Due Date */}
            <select
              className="filter-select"
              value={filters.dueRange}
              onChange={(e) => setFilters((prev) => ({ ...prev, dueRange: e.target.value }))}
              title="Filter by Due Date"
            >
              <option value="all">All Due Dates</option>
              <option value="overdue">Overdue Tasks</option>
              <option value="today">Due Today</option>
              <option value="week">Due This Week</option>
            </select>
          </div>

          <div className="filters-group">
            {/* Sort Toggle buttons */}
            <button
              className={`btn btn-secondary ${filters.sortBy === 'createdAt' ? 'pulse' : ''}`}
              onClick={() => handleSortChange('createdAt')}
              style={{
                fontSize: '0.85rem',
                borderColor: filters.sortBy === 'createdAt' ? 'var(--accent-primary)' : 'var(--border-color)',
                color: filters.sortBy === 'createdAt' ? 'var(--accent-primary)' : 'var(--text-primary)'
              }}
            >
              Sort Created {filters.sortBy === 'createdAt' && (filters.order === 'desc' ? '↓' : '↑')}
            </button>
            <button
              className={`btn btn-secondary ${filters.sortBy === 'dueDate' ? 'pulse' : ''}`}
              onClick={() => handleSortChange('dueDate')}
              style={{
                fontSize: '0.85rem',
                borderColor: filters.sortBy === 'dueDate' ? 'var(--accent-primary)' : 'var(--border-color)',
                color: filters.sortBy === 'dueDate' ? 'var(--accent-primary)' : 'var(--text-primary)'
              }}
            >
              Sort Due Date {filters.sortBy === 'dueDate' && (filters.order === 'desc' ? '↓' : '↑')}
            </button>
            <button
              className={`btn btn-secondary ${filters.sortBy === 'priority' ? 'pulse' : ''}`}
              onClick={() => handleSortChange('priority')}
              style={{
                fontSize: '0.85rem',
                borderColor: filters.sortBy === 'priority' ? 'var(--accent-primary)' : 'var(--border-color)',
                color: filters.sortBy === 'priority' ? 'var(--accent-primary)' : 'var(--text-primary)'
              }}
            >
              Sort Priority {filters.sortBy === 'priority' && (filters.order === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main>
        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3 className="empty-title">No tasks to display</h3>
            <p className="empty-subtitle">Get started by creating a task or adjusting your search filters.</p>
            <button className="btn btn-primary" onClick={handleCreateClick}>
              Create First Task
            </button>
          </div>
        ) : activeView === 'kanban' ? (
          <TaskBoard
            tasks={tasks}
            onEdit={handleEditClick}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <TaskList
            tasks={tasks}
            onEdit={handleEditClick}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>

      {/* Task Creation & Modification Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}

export default App;
