import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import * as Switch from "@radix-ui/react-switch";
import { X, ChevronDown, Check, Globe, Briefcase, Palette } from "lucide-react";
import { useAppSettings } from "../contexts/AppSettingsContext";
import type { Language } from "../contexts/AppSettingsContext";
import { useTheme } from "./ThemeProvider";
import { useWorkSettings } from "./WorkSettingsDialog";
import type { WorkHoursSettings } from "./WorkSettingsDialog";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ── Extracted outside to avoid 'component created during render' error ── */
function SectionHeader({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-blue-600 dark:text-blue-400">{icon}</span>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
        {label}
      </h3>
    </div>
  );
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { userName, setUserName, language, setLanguage, t } = useAppSettings();
  const { theme, toggleTheme } = useTheme();
  const {
    settings: workSettings,
    updateSettings: updateWorkSettings,
    defaultSettings,
  } = useWorkSettings();

  /* local copies so user can cancel without persisting — initialised fresh each mount (dialog re-mounts on open) */
  const [localName, setLocalName] = useState(userName ?? "");
  const [localLanguage, setLocalLanguage] = useState<Language>(language);
  const [localWork, setLocalWork] = useState<WorkHoursSettings>(workSettings);

  const handleSave = () => {
    const trimmed = localName.trim();
    if (trimmed) setUserName(trimmed);
    setLanguage(localLanguage);
    updateWorkSettings(localWork);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalWork(defaultSettings);
  };

  /* ─── helpers are now defined outside the component ─────────── */
  const selectTriggerCls =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white flex items-center justify-between text-sm";
  const selectItemCls =
    "px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer flex items-center justify-between";
  const numberInputCls =
    "w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center text-sm";
  const labelCls = "block text-sm text-gray-600 dark:text-gray-400 mb-1.5";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                     bg-white dark:bg-gray-800 sm:rounded-xl rounded-t-2xl shadow-2xl
                     w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[90vh] flex flex-col z-50"
        >
          {/* ── drag handle (mobile only) ── */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          {/* ── header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
              {t("settings")}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* ── scrollable body ── */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-8">
            {/* ── 1. Appearance ── */}
            <section>
              <SectionHeader
                icon={<Palette className="h-4 w-4" />}
                label={t("appearance")}
              />

              {/* Display name */}
              <div className="mb-5">
                <label className={labelCls}>{t("displayName")}</label>
                <input
                  type="text"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  placeholder={t("changeNamePlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Theme toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t("darkMode")}
                </span>
                <Switch.Root
                  dir="ltr"
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                  className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative data-[state=checked]:bg-blue-600 transition-colors outline-none"
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
                </Switch.Root>
              </div>
            </section>

            {/* ── 2. Language ── */}
            <section>
              <SectionHeader
                icon={<Globe className="h-4 w-4" />}
                label={t("languageSection")}
              />
              <div className="grid grid-cols-2 gap-3">
                {(["en", "he"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLocalLanguage(lang)}
                    className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                      localLanguage === lang
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    {lang === "en" ? "English" : "עברית"}
                  </button>
                ))}
              </div>
            </section>

            {/* ── 3. Work Hours ── */}
            <section>
              <SectionHeader
                icon={<Briefcase className="h-4 w-4" />}
                label={t("workHoursSettings")}
              />

              {/* Work Day Length */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  {t("workDayLength")}
                </p>
                {/* Regular Days */}
                <div className="mb-3">
                  <label className={labelCls}>{t("regularDays")}</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={localWork.regularDayHours}
                      onChange={(e) =>
                        setLocalWork({
                          ...localWork,
                          regularDayHours: parseInt(e.target.value) || 0,
                        })
                      }
                      className={numberInputCls}
                    />
                    <span className="text-sm text-gray-500">{t("hours")}</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={localWork.regularDayMinutes}
                      onChange={(e) =>
                        setLocalWork({
                          ...localWork,
                          regularDayMinutes: parseInt(e.target.value) || 0,
                        })
                      }
                      className={numberInputCls}
                    />
                    <span className="text-sm text-gray-500">
                      {t("minutes")}
                    </span>
                  </div>
                </div>
                {/* Thursday */}
                <div>
                  <label className={labelCls}>{t("thursdayShort")}</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={localWork.thursdayHours}
                      onChange={(e) =>
                        setLocalWork({
                          ...localWork,
                          thursdayHours: parseInt(e.target.value) || 0,
                        })
                      }
                      className={numberInputCls}
                    />
                    <span className="text-sm text-gray-500">{t("hours")}</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={localWork.thursdayMinutes}
                      onChange={(e) =>
                        setLocalWork({
                          ...localWork,
                          thursdayMinutes: parseInt(e.target.value) || 0,
                        })
                      }
                      className={numberInputCls}
                    />
                    <span className="text-sm text-gray-500">
                      {t("minutes")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Calendar Settings */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  {t("calendarSettings")}
                </p>
                <div className="mb-3">
                  <label className={labelCls}>{t("weekStartsOn")}</label>
                  <Select.Root
                    value={localWork.weekStartDay.toString()}
                    onValueChange={(v) =>
                      setLocalWork({
                        ...localWork,
                        weekStartDay: parseInt(v) as 0 | 1 | 6,
                      })
                    }
                  >
                    <Select.Trigger className={selectTriggerCls}>
                      <Select.Value />
                      <Select.Icon>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[200]">
                        <Select.Viewport className="p-1">
                          {[
                            { value: "0", label: t("sunday") },
                            { value: "1", label: t("monday") },
                            { value: "6", label: t("saturday") },
                          ].map((d) => (
                            <Select.Item
                              key={d.value}
                              value={d.value}
                              className={selectItemCls}
                            >
                              <Select.ItemText>{d.label}</Select.ItemText>
                              <Select.ItemIndicator>
                                <Check className="h-4 w-4 text-blue-600" />
                              </Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
                <div className="mb-3">
                  <label className={labelCls}>{t("defaultCalendarView")}</label>
                  <Select.Root
                    value={localWork.defaultView}
                    onValueChange={(v) =>
                      setLocalWork({
                        ...localWork,
                        defaultView: v as "month" | "week",
                      })
                    }
                  >
                    <Select.Trigger className={selectTriggerCls}>
                      <Select.Value />
                      <Select.Icon>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[200]">
                        <Select.Viewport className="p-1">
                          {[
                            { value: "month", label: t("monthView") },
                            { value: "week", label: t("weekView") },
                          ].map((o) => (
                            <Select.Item
                              key={o.value}
                              value={o.value}
                              className={selectItemCls}
                            >
                              <Select.ItemText>{o.label}</Select.ItemText>
                              <Select.ItemIndicator>
                                <Check className="h-4 w-4 text-blue-600" />
                              </Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={localWork.showWeekNumbers}
                    onChange={(e) =>
                      setLocalWork({
                        ...localWork,
                        showWeekNumbers: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t("showWeekNumbers")}
                  </span>
                </label>
              </div>

              {/* Display Settings */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  {t("displaySettings")}
                </p>
                <label className={labelCls}>{t("timeFormat")}</label>
                <Select.Root
                  value={localWork.timeFormat}
                  onValueChange={(v) =>
                    setLocalWork({
                      ...localWork,
                      timeFormat: v as "24h" | "12h",
                    })
                  }
                >
                  <Select.Trigger className={selectTriggerCls}>
                    <Select.Value />
                    <Select.Icon>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[200]">
                      <Select.Viewport className="p-1">
                        {[
                          { value: "24h", label: t("format24h") },
                          { value: "12h", label: t("format12h") },
                        ].map((o) => (
                          <Select.Item
                            key={o.value}
                            value={o.value}
                            className={selectItemCls}
                          >
                            <Select.ItemText>{o.label}</Select.ItemText>
                            <Select.ItemIndicator>
                              <Check className="h-4 w-4 text-blue-600" />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </section>
          </div>

          {/* ── footer / actions ── */}
          <div className="shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {t("resetDefaults")}
            </button>
            <div className="flex gap-3">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  {t("cancel")}
                </button>
              </Dialog.Close>
              <button
                onClick={handleSave}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {t("saveSettings")}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
