import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import type { FilterType } from '../types/todo';

interface TodoFiltersProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  stats: {
    total: number;
    active: number;
    completed: number;
    blocked: number;
  };
}

export function TodoFilters({ currentFilter, onFilterChange, stats }: TodoFiltersProps) {
  return (
    <Tabs.Root value={currentFilter} onValueChange={(value) => onFilterChange(value as FilterType)}>
      <Tabs.List className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        <Tabs.Trigger
          value="all"
          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-colors"
        >
          All ({stats.total})
        </Tabs.Trigger>
        <Tabs.Trigger
          value="active"
          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-colors"
        >
          Active ({stats.active})
        </Tabs.Trigger>
        <Tabs.Trigger
          value="completed"
          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-colors"
        >
          Completed ({stats.completed})
        </Tabs.Trigger>
        <Tabs.Trigger
          value="blocked"
          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-colors"
        >
          Blocked ({stats.blocked})
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  );
}
