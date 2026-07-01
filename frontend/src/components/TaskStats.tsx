import React from 'react';
import type { Task } from '../types';

interface TaskStatsProps {
  tasks: Task[];
}

export const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const highPriority = tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="stats-grid">
      {/* Progress Card */}
      <div className="stats-progress-card">
        <div className="progress-header">
          <span>Task Progress</span>
          <span>
            {completed}/{total} Completed ({completionRate}%)
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${completionRate}%` }}></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </div>
        <div className="stat-info">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-pending-bg)', color: 'var(--status-pending-text)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div className="stat-info">
          <span className="stat-value">{pending}</span>
          <span className="stat-label">Pending</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-progress-bg)', color: 'var(--status-progress-text)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12a10 10 0 0 1-17 7.3"></path>
            <path d="M2 12A10 10 0 0 1 19 4.7"></path>
            <polyline points="22 4 22 12 14 12"></polyline>
            <polyline points="2 20 2 12 10 12"></polyline>
          </svg>
        </div>
        <div className="stat-info">
          <span className="stat-value">{inProgress}</span>
          <span className="stat-label">In Progress</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-completed-bg)', color: 'var(--status-completed-text)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div className="stat-info">
          <span className="stat-value">{completed}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--priority-high-bg)', color: 'var(--priority-high-text)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" y1="22" x2="4" y2="15"></line>
          </svg>
        </div>
        <div className="stat-info">
          <span className="stat-value">{highPriority}</span>
          <span className="stat-label">High Priority</span>
        </div>
      </div>
    </div>
  );
};
