export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export type FilterType = 'all' | 'active' | 'completed' | 'blocked';

export type SortField = 'dueDate' | 'priority' | 'createdAt' | 'title';

export type SortOrder = 'asc' | 'desc';

export interface DashboardStats {
  total: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  blocked: number;
}

export type { Todo as TodoType };
