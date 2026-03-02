import { Plus } from "lucide-react";
import { useAppSettings } from "../contexts/AppSettingsContext";

interface TodoHeaderProps {
  onAddClick: () => void;
}

export function TodoHeader({ onAddClick }: TodoHeaderProps) {
  const { t } = useAppSettings();
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("taskDashboard")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t("manageTrackTasks")}
            </p>
          </div>
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            {t("addTask")}
          </button>
        </div>
      </div>
    </div>
  );
}
