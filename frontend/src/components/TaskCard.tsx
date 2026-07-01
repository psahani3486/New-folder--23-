import React from 'react';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const isCompleted = task.status === 'completed';

  // Format date nicely
  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Determine if task is overdue
  const checkOverdue = () => {
    if (!task.dueDate || isCompleted) return false;
    const due = new Date(task.dueDate);
    due.setHours(23, 59, 59, 999);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const isOverdue = checkOverdue();

  // HTML5 Drag Start
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    const cardEl = e.currentTarget as HTMLElement;
    cardEl.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const cardEl = e.currentTarget as HTMLElement;
    cardEl.classList.remove('dragging');
  };

  // Advance status logic
  const handleAdvanceStatus = () => {
    if (task.status === 'pending') {
      onStatusChange(task.id, 'in-progress');
    } else if (task.status === 'in-progress') {
      onStatusChange(task.id, 'completed');
    } else if (task.status === 'completed') {
      onStatusChange(task.id, 'pending');
    }
  };

  return (
    <div
      className={`task-card ${isCompleted ? 'completed-task' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      title="Drag this card to change status"
    >
      <div className="card-header">
        <div className="card-tags">
          <span className={`badge badge-${task.status}`}>{task.status.replace('-', ' ')}</span>
          <span className={`badge badge-${task.priority}`}>{task.priority} Priority</span>
        </div>

        <div className="card-actions-menu">
          {/* Edit Button */}
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

          {/* Delete Button */}
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

      <h4 className="task-title" title={task.title}>
        {task.title}
      </h4>

      {task.description && (
        <p className="task-desc" title={task.description}>
          {task.description}
        </p>
      )}

      <div className="card-footer">
        <div className={`due-date ${isOverdue ? 'overdue-warning' : ''}`}>
          {task.dueDate ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{isOverdue ? 'Overdue: ' : 'Due: '}{formatDueDate(task.dueDate)}</span>
            </>
          ) : (
            <span>No due date</span>
          )}
        </div>

        {/* Quick Shift status changer button */}
        <button
          className="quick-move-btn"
          onClick={handleAdvanceStatus}
          title={`Change status to: ${
            task.status === 'pending'
              ? 'In Progress'
              : task.status === 'in-progress'
              ? 'Completed'
              : 'Pending'
          }`}
        >
          {task.status === 'pending' ? 'Start' : task.status === 'in-progress' ? 'Complete' : 'Reopen'}
        </button>
      </div>
    </div>
  );
};
