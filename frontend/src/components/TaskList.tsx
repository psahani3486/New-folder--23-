import React from 'react';
import type { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  // Format date nicely
  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Determine if task is overdue
  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'completed') return false;
    const due = new Date(task.dueDate);
    due.setHours(23, 59, 59, 999);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const handleCheckboxClick = (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    onStatusChange(task.id, nextStatus);
  };

  return (
    <div className="list-container">
      {tasks.length > 0 ? (
        tasks.map((task) => {
          const isCompleted = task.status === 'completed';
          const overdue = isOverdue(task);

          return (
            <div key={task.id} className={`list-task-row ${isCompleted ? 'completed-task' : ''}`}>
              {/* Checkbox */}
              <div className="list-checkbox-wrapper">
                <div
                  className={`custom-checkbox ${isCompleted ? 'checked' : ''}`}
                  onClick={() => handleCheckboxClick(task)}
                  title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                  aria-label="Toggle completed state"
                >
                  {isCompleted && (
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Grid Information */}
              <div className="list-task-info">
                <div className="list-title-desc">
                  <span className="list-title" title={task.title}>
                    {task.title}
                  </span>
                  {task.description && (
                    <span className="list-desc" title={task.description}>
                      {task.description}
                    </span>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <span className={`badge badge-${task.priority}`}>{task.priority} Priority</span>
                </div>

                {/* Status */}
                <div>
                  <span className={`badge badge-${task.status}`}>{task.status.replace('-', ' ')}</span>
                </div>

                {/* Due Date */}
                <div className={`due-date ${overdue ? 'overdue-warning' : ''}`} style={{ fontSize: '0.88rem' }}>
                  {task.dueDate ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>{formatDueDate(task.dueDate)}</span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>No due date</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="card-actions-menu">
                <button
                  className="card-action-btn"
                  onClick={() => onEdit(task)}
                  title="Edit Task"
                  aria-label="Edit task"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>

                <button
                  className="card-action-btn delete-btn"
                  onClick={() => onDelete(task.id)}
                  title="Delete Task"
                  aria-label="Delete task"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <div className="empty-title">No tasks found</div>
          <p className="empty-subtitle">Try refining your filters or create a new task to get started.</p>
        </div>
      )}
    </div>
  );
};
