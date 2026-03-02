import { useState, useRef } from "react";
import {
  Download,
  Upload,
  Database,
  HardDrive,
  FileJson,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import {
  exportToJson,
  importFromJson,
  exportAllDataToJson,
  importAllDataFromJson,
} from "../utils/jsonExport";
import { useWorkHours } from "../hooks/useWorkHours";
import { useAppSettings } from "../contexts/AppSettingsContext";

export function BackupManager() {
  const { workDayEntries, summary, updateSummary, importWorkDayEntries } =
    useWorkHours();
  const { t } = useAppSettings();
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error" | "info" | null;
    message: string;
  }>({ type: null, message: "" });

  const fullBackupFileInputRef = useRef<HTMLInputElement>(null);
  const workHoursFileInputRef = useRef<HTMLInputElement>(null);

  const handleExportFullBackup = () => {
    exportAllDataToJson();
    setImportStatus({ type: "success", message: t("backupExportedMsg") });
    setTimeout(() => setImportStatus({ type: null, message: "" }), 3000);
  };

  const handleExportWorkHours = () => {
    exportToJson(workDayEntries, summary);
    setImportStatus({ type: "success", message: t("workHoursExportedMsg") });
    setTimeout(() => setImportStatus({ type: null, message: "" }), 3000);
  };

  const handleImportFullBackup = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmRestore = confirm(t("restoreConfirmMsg"));

    if (!confirmRestore) {
      if (fullBackupFileInputRef.current) {
        fullBackupFileInputRef.current.value = "";
      }
      return;
    }

    const result = await importAllDataFromJson(file);
    if (result.success && result.itemsImported) {
      alert(t("restoreSuccessMsg"));
      window.location.reload();
    } else {
      setImportStatus({
        type: "error",
        message: `${t("importFailedMsg")}: ${result.error}`,
      });
    }

    // Reset file input
    if (fullBackupFileInputRef.current) {
      fullBackupFileInputRef.current.value = "";
    }
  };

  const handleImportWorkHours = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await importFromJson(file);
    if (result.success && result.data) {
      const confirmReplace = confirm(
        `${result.data.workDayEntries.length} ${t("workEntriesLabel")} (${result.data.exportDate.split("T")[0]}).\n\n${t("workHoursReplaceConfirm")}`,
      );

      importWorkDayEntries(
        result.data.workDayEntries,
        confirmReplace ? "replace" : "merge",
      );
      updateSummary(result.data.workSummary);
      setImportStatus({
        type: "success",
        message: `${t("workHoursImportedSuccess")} (${result.data.workDayEntries.length})`,
      });
    } else {
      setImportStatus({
        type: "error",
        message: `${t("importFailedMsg")}: ${result.error}`,
      });
    }

    // Reset file input
    if (workHoursFileInputRef.current) {
      workHoursFileInputRef.current.value = "";
    }
  };

  const getStorageInfo = () => {
    const todos = JSON.parse(localStorage.getItem("todos") || "[]");
    const entries = JSON.parse(localStorage.getItem("workDayEntries") || "[]");
    const settings = localStorage.getItem("workHoursSettings");

    return {
      todos: todos.length,
      workEntries: entries.length,
      hasSettings: !!settings,
    };
  };

  const storageInfo = getStorageInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Database className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("backupAndRestore")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t("exportImportSafely")}
              </p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {importStatus.type && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
              importStatus.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
                : importStatus.type === "error"
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
                  : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300"
            }`}
          >
            {importStatus.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : importStatus.type === "error" ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <Info className="h-5 w-5" />
            )}
            <p className="font-medium">{importStatus.message}</p>
          </div>
        )}

        {/* Current Data Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("currentDataOverview")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("totalTodosLabel")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {storageInfo.todos}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Database className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("workEntriesLabel")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {storageInfo.workEntries}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <HardDrive className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("settings")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {storageInfo.hasSettings
                    ? t("settingsConfigured")
                    : t("settingsDefault")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full Backup Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <HardDrive className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("fullSystemBackup")}
            </h2>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong>{t("fullBackupDesc")}</strong>
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
              <li>All todos and task data</li>
              <li>Complete work hours history</li>
              <li>Work hours settings and preferences</li>
              <li>Theme preference</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleExportFullBackup}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <Download className="h-5 w-5" />
              {t("exportFullBackup")}
            </button>

            <label className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm cursor-pointer">
              <Upload className="h-5 w-5" />
              {t("restoreFullBackup")}
              <input
                ref={fullBackupFileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFullBackup}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            File format:{" "}
            <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
              todo-dashboard-backup-YYYY-MM-DD.json
            </code>
          </p>
        </div>

        {/* Work Hours Only Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <FileJson className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("workHoursOnlyTitle")}
            </h2>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {t("workHoursOnlyDesc")}
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
              <li>Work day entries and history</li>
              <li>Work summary statistics</li>
              <li>Does not include todos or settings</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleExportWorkHours}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <Download className="h-5 w-5" />
              {t("exportWorkHoursBtn")}
            </button>

            <label className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors shadow-sm cursor-pointer">
              <Upload className="h-5 w-5" />
              {t("importWorkHoursBtn")}
              <input
                ref={workHoursFileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportWorkHours}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            File format:{" "}
            <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
              work-hours-backup-YYYY-MM-DD.json
            </code>
          </p>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">
                {t("importantInfoTitle")}
              </h3>
              <ul className="text-sm text-amber-800 dark:text-amber-400 space-y-1 list-disc ml-4">
                <li>
                  All data is stored locally in your browser's localStorage
                </li>
                <li>Regular backups are recommended to prevent data loss</li>
                <li>
                  When transferring to another computer, use the Full Backup
                  option
                </li>
                <li>
                  Importing will replace or merge existing data based on your
                  choice
                </li>
                <li>Keep your backup files in a safe location</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
