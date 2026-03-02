import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useAppSettings } from "../contexts/AppSettingsContext";

interface StatsCardProps {
  stats: {
    total: number;
    active: number;
    completed: number;
    blocked: number;
  };
}

export function StatsCards({ stats }: StatsCardProps) {
  const { t } = useAppSettings();
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 md:p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
              {t("totalTasks")}
            </p>
            <p className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          <LayoutDashboard className="h-5 w-5 md:h-10 md:w-10 text-blue-500 hidden sm:block" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 md:p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
              {t("completedTasks")}
            </p>
            <p className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {stats.completed}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              {completionRate}% {t("done")}
            </p>
          </div>
          <CheckCircle2 className="h-5 w-5 md:h-10 md:w-10 text-green-500 hidden sm:block" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 md:p-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
              {t("activeTasks")}
            </p>
            <p className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {stats.active}
            </p>
          </div>
          <Clock className="h-5 w-5 md:h-10 md:w-10 text-yellow-500 hidden sm:block" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 md:p-6 border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
              {t("blockedTasks")}
            </p>
            <p className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {stats.blocked}
            </p>
          </div>
          <AlertCircle className="h-5 w-5 md:h-10 md:w-10 text-red-500 hidden sm:block" />
        </div>
      </div>
    </div>
  );
}
