import React from 'react';
import type { Task } from '../types';
import { TaskCard } from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Required to allow dropping
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onStatusChange(taskId, status);
    }
  };

  const renderColumn = (
    title: string,
    status: Task['status'],
    columnTasks: Task[],
    headerColor: string
  ) => {
    return (
      <div
        className="kanban-column"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        <div className="column-header">
          <span className="column-title">
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: headerColor,
                display: 'inline-block',
              }}
            ></span>
            {title}
          </span>
          <span className="column-count">{columnTasks.length}</span>
        </div>

        <div className="column-cards-container">
          {columnTasks.length > 0 ? (
            columnTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '2.5rem 1rem',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                border: '1.5px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                marginTop: '0.5rem',
              }}
            >
              No tasks here
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="kanban-container">
      {renderColumn('To Do', 'pending', pendingTasks, '#f59e0b')}
      {renderColumn('In Progress', 'in-progress', inProgressTasks, '#0ea5e9')}
      {renderColumn('Completed', 'completed', completedTasks, '#10b981')}
    </div>
  );
};
