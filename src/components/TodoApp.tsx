import React, { useState } from 'react';
import { useTodos } from '../hooks/useTodos';
import { TodoHeader } from './TodoHeader';
import { StatsCards } from './StatsCards';
import { TodoFilters } from './TodoFilters';
import { TodoTable } from './TodoTable';
import { AddTodoDialog } from './AddTodoDialog';
import { EditTodoDialog } from './EditTodoDialog';
import { DeleteAlert } from './DeleteAlert';
import type { Todo } from '../types/todo';

export function TodoApp() {
  const {
    todos,
    filter,
    setFilter,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    stats,
  } = useTodos();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);

  const handleEdit = (todo: Todo) => {
    setSelectedTodo(todo);
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTodoToDelete(id);
    setDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    if (todoToDelete) {
      deleteTodo(todoToDelete);
      setTodoToDelete(null);
      setDeleteAlertOpen(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <TodoHeader onAddClick={() => setAddDialogOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <StatsCards stats={stats} />

        <TodoFilters
          currentFilter={filter}
          onFilterChange={setFilter}
          stats={stats}
        />

        <TodoTable
          todos={todos}
          onToggle={toggleComplete}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <AddTodoDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={addTodo}
      />

      <EditTodoDialog
        todo={selectedTodo}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={updateTodo}
      />

      <DeleteAlert
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
