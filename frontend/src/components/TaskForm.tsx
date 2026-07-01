import React, { useState, useEffect } from 'react';
import type { Task, TaskFormData, TaskStatus, TaskPriority } from '../types';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TaskFormData) => Promise<void>;
  taskToEdit?: Task | null;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');

  // Validation States
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [isDueDatePast, setIsDueDatePast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load task values for editing
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      if (taskToEdit.dueDate) {
        // Convert to YYYY-MM-DD for date inputs
        const dateObj = new Date(taskToEdit.dueDate);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        setDueDate(`${year}-${month}-${day}`);
      } else {
        setDueDate('');
      }
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setStatus('pending');
      setPriority('medium');
      setDueDate('');
    }
    setErrors({});
  }, [taskToEdit, isOpen]);

  // Check if due date is in the past
  useEffect(() => {
    if (dueDate) {
      const selected = new Date(dueDate);
      selected.setHours(23, 59, 59, 999); // Allow today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setIsDueDatePast(selected < today);
    } else {
      setIsDueDatePast(false);
    }
  }, [dueDate]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: { title?: string; description?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate,
      });
      onClose();
    } catch (error) {
      console.error('Error submitting task form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{taskToEdit ? 'Edit Task' : 'Create New Task'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="task-title">Title *</label>
            <input
              id="task-title"
              type="text"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              placeholder="e.g. Implement API validation layer"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              disabled={isSubmitting}
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              placeholder="Provide a detailed description of the task requirements..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              disabled={isSubmitting}
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>

          <div className="form-row">
            {/* Status */}
            <div className="form-group">
              <label htmlFor="task-status">Status</label>
              <select
                id="task-status"
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                disabled={isSubmitting}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                disabled={isSubmitting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label htmlFor="task-duedate">Due Date</label>
            <input
              id="task-duedate"
              type="date"
              className="form-control"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isSubmitting}
            />
            {isDueDatePast && (
              <div className="invalid-feedback" style={{ color: 'var(--status-pending-text)' }}>
                ⚠ Warning: The selected due date is in the past.
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
