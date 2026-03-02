import { TodoRow } from "./TodoRow";
import type { Todo } from "../types/todo";
import { useAppSettings } from "../contexts/AppSettingsContext";

interface TodoTableProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TodoTable({
  todos,
  onToggle,
  onEdit,
  onDelete,
}: TodoTableProps) {
  const { t } = useAppSettings();
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-blue-600 dark:bg-blue-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-12">
              {t("statusLabel")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              {t("colTask")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              {t("descriptionLabel")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              {t("priorityLabel")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              {t("colStatusType")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              {t("progressLabel")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              {t("categoryLabel")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              {t("dueDateLabel")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider w-12">
              {t("actions")}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {todos.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
              >
                {t("noTasksFound")}
              </td>
            </tr>
          ) : (
            todos.map((todo) => (
              <TodoRow
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
