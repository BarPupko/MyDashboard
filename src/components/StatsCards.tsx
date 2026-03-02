import React from 'react';
import { LayoutDashboard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface StatsCardProps {
  stats: {
    total: number;
    active: number;
    completed: number;
    blocked: number;
  };
}

export function StatsCards({ stats }: StatsCardProps) {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <LayoutDashboard className="h-10 w-10 text-blue-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{completionRate}% done</p>
          </div>
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
          </div>
          <Clock className="h-10 w-10 text-yellow-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blocked</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.blocked}</p>
          </div>
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
      </div>
    </div>
  );
}
