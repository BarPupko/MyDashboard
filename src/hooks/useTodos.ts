import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Todo, FilterType, SortField, SortOrder } from '../types/todo';

export function useTodos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const addTodo = (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTodo: Todo = {
      ...todo,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTodos([...todos, newTodo]);
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
          : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const toggleComplete = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              status: !todo.completed ? 'completed' : 'pending',
              updatedAt: new Date().toISOString(),
            }
          : todo
      )
    );
  };

  const getFilteredTodos = () => {
    let filtered = todos;

    switch (filter) {
      case 'active':
        filtered = todos.filter((todo) => !todo.completed);
        break;
      case 'completed':
        filtered = todos.filter((todo) => todo.completed);
        break;
      case 'blocked':
        filtered = todos.filter((todo) => todo.status === 'blocked');
        break;
      default:
        filtered = todos;
    }

    // Sort
    return filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'priority') {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    active: todos.filter((t) => !t.completed).length,
    blocked: todos.filter((t) => t.status === 'blocked').length,
  };

  return {
    todos: getFilteredTodos(),
    allTodos: todos,
    filter,
    setFilter,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    stats,
  };
}
