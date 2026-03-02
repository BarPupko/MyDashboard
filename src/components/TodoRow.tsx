
import * as Checkbox from '@radix-ui/react-checkbox';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, MoreVertical, Edit, Trash2 } from 'lucide-react';
import type { Todo } from '../types/todo';

interface TodoRowProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TodoRow({ todo, onToggle, onEdit, onDelete }: TodoRowProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800 ${todo.completed ? 'opacity-60' : ''}`}>
      <td className="px-4 py-3">
        <Checkbox.Root
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id)}
          className="flex h-5 w-5 items-center justify-center rounded border-2 border-gray-300 bg-white hover:border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
        >
          <Checkbox.Indicator>
            <Check className="h-4 w-4 text-white" />
          </Checkbox.Indicator>
        </Checkbox.Root>
      </td>
      <td className="px-4 py-3 font-medium">{todo.title}</td>
      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{todo.description}</td>
      <td className="px-4 py-3">
        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${getPriorityColor(todo.priority)}`}>
          {todo.priority}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusColor(todo.status)}`}>
          {todo.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${todo.progress}%` }}
          ></div>
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400">{todo.progress}%</span>
      </td>
      <td className="px-4 py-3 text-sm">{todo.category}</td>
      <td className="px-4 py-3 text-sm">{new Date(todo.dueDate).toLocaleDateString()}</td>
      <td className="px-4 py-3">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="min-w-[160px] bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-1">
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded outline-none"
                onSelect={() => onEdit(todo)}
              >
                <Edit className="h-4 w-4" />
                Edit
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 rounded outline-none"
                onSelect={() => onDelete(todo.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </td>
    </tr>
  );
}
