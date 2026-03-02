import React from 'react';
import type { DashboardStats } from '../types/todo';

interface DashboardStatsProps {
  stats: DashboardStats;
}

export const DashboardStatsBar: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-300 dark:border-blue-700">
        <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Tasks</div>
        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</div>
      </div>
      <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg border border-red-300 dark:border-red-700">
        <div className="text-sm font-medium text-red-700 dark:text-red-300">Not Started</div>
        <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.notStarted}</div>
      </div>
      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg border border-yellow-300 dark:border-yellow-700">
        <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300">In Progress</div>
        <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.inProgress}</div>
      </div>
      <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg border border-green-300 dark:border-green-700">
        <div className="text-sm font-medium text-green-700 dark:text-green-300">Completed</div>
        <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.completed}</div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Blocked</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.blocked}</div>
      </div>
    </div>
  );
};
