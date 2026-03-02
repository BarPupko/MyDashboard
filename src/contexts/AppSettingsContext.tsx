import React, { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export type Language = "en" | "he";

/* ─────────────────────────── translations ─────────────────────────── */

const translations = {
  en: {
    // Nav
    tasks: "Tasks",
    workHours: "Work Hours",
    backups: "Backups",
    settings: "Settings",
    menu: "Menu",
    // First-visit prompt
    welcome: "Welcome!",
    enterYourName: "Enter your name to personalise your dashboard.",
    letsGo: "Let's go",
    yourName: "Your name",
    doubleclickRename: "Double-click to rename",
    // Settings dialog – sections
    appearance: "Appearance",
    languageSection: "Language",
    workHoursSettings: "Work Hours Settings",
    // Appearance settings
    displayName: "Display Name",
    changeNamePlaceholder: "Your name",
    darkMode: "Dark Mode",
    // Language
    selectLanguage: "Select language",
    english: "English",
    hebrew: "Hebrew (עברית)",
    // Work hours – day length
    workDayLength: "Work Day Length",
    regularDays: "Regular Days (Sun–Wed)",
    thursdayShort: "Thursday (Short Day)",
    hours: "hours",
    minutes: "minutes",
    // Work hours – calendar
    calendarSettings: "Calendar Settings",
    weekStartsOn: "Week Starts On",
    defaultCalendarView: "Default Calendar View",
    showWeekNumbers: "Show Week Numbers",
    monthView: "Month View",
    weekView: "Week View",
    sunday: "Sunday",
    monday: "Monday",
    saturday: "Saturday",
    // work hours – display
    displaySettings: "Display Settings",
    timeFormat: "Time Format",
    format24h: "24-hour (14:30)",
    format12h: "12-hour (2:30 PM)",
    // Actions
    saveSettings: "Save Settings",
    resetDefaults: "Reset to Defaults",
    cancel: "Cancel",
    // Todo page
    taskDashboard: "Task Dashboard",
    manageTrackTasks: "Manage and track your tasks efficiently",
    addTask: "Add Task",
    totalTasks: "Total Tasks",
    completedTasks: "Completed",
    done: "done",
    activeTasks: "Active",
    blockedTasks: "Blocked",
    filterAll: "All",
    filterActive: "Active",
    filterCompleted: "Completed",
    filterBlocked: "Blocked",
    // AddTodo dialog
    addNewTask: "Add New Task",
    taskTitle: "Task Title",
    taskTitlePlaceholder: "Enter task title",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Enter task description",
    priorityLabel: "Priority",
    priorityLow: "Low",
    priorityMedium: "Medium",
    priorityHigh: "High",
    statusLabel: "Status",
    statusPending: "Pending",
    statusInProgress: "In Progress",
    statusCompleted: "Completed",
    statusBlocked: "Blocked",
    categoryLabel: "Category",
    categoryPlaceholder: "e.g. Frontend, Backend",
    dueDateLabel: "Due Date",
    progressLabel: "Progress (%)",
    submitAddTask: "Add Task",
    // Work dashboard
    workHoursDashboard: "Work Hours Dashboard",
    trackWorkHours: "Track your work hours and manage your time",
    todayLabel: "Today",
    workDayLengthLabel: "Work Day Length",
    shortDay: "Short day",
    regularDay: "Regular day",
    vacationDays: "Vacation Days",
    sickDays: "Sick Days",
    todaysWorkTime: "Today's Work Time",
    entryTimeLabel: "Entry Time",
    etaExitLabel: "ETA Exit",
    tillEndLabel: "Time Left",
    startWork: "Start Work",
    endWork: "End Work",
    weekendTitle: "Weekend",
    dayOffMsg: "Today is a day off. Enjoy your rest!",
    hoursSummary: "Hours Summary",
    totalMissingHours: "Total Missing Hours",
    workSchedule: "Work Schedule",
    offDay: "Off",
    calendarView: "Calendar View",
    tableView: "Table View",
    workStatistics: "Work Statistics",
    totalDaysTracked: "Total Days Tracked",
    daysOnTime: "Days On Time",
    totalOvertime: "Total Overtime",
    vacationDaysUsed: "Vacation Days Used",
    // EditTodo dialog
    editTask: "Edit Task",
    saveChanges: "Save Changes",
    // DeleteAlert
    deleteTask: "Delete Task",
    deleteConfirmMsg:
      "Are you sure you want to delete this task? This action cannot be undone.",
    deleteBtn: "Delete",
    // WorkDayDialog
    save: "Save",
    requiredHoursLabel: "Required hours",
    hoursWorkedLabel: "Hours Worked",
    overtimeLabel: "Overtime",
    vacationCheckbox: "Vacation",
    sickCheckbox: "Sick",
    wfhCheckbox: "Work From Home",
    entryLabel: "Entry",
    exitLabel: "Exit",
    notesLabel: "Notes",
    metRequirement: "Met",
    notMetRequirement: "Not Met",
    // WorkTable
    actions: "Actions",
    noWorkDaysMsg:
      "No work days recorded. Click on a day in the calendar to add data.",
    // WorkCalendar
    monthTab: "Month",
    weekTab: "Week",
    importExcel: "Import Excel",
    exportToExcel: "Export to Excel",
    legendOnTime: "On Time",
    legendLate: "Late / Short",
    legendWeekend: "Weekend",
    legendVacation: "Vacation",
    legendWFH: "Work From Home",
    legendNote: "Note",
    // BackupManager
    backupAndRestore: "Backup & Restore",
    exportImportSafely: "Export and import your data safely",
    currentDataOverview: "Current Data Overview",
    totalTodosLabel: "Total Todos",
    workEntriesLabel: "Work Entries",
    settingsConfigured: "Configured",
    settingsDefault: "Default",
    fullSystemBackup: "Full System Backup",
    fullBackupDesc: "Recommended: Export everything in one file",
    exportFullBackup: "Export Full Backup",
    restoreFullBackup: "Restore Full Backup",
    workHoursOnlyTitle: "Work Hours Only",
    workHoursOnlyDesc: "Export or import only work hours data",
    exportWorkHoursBtn: "Export Work Hours",
    importWorkHoursBtn: "Import Work Hours",
    importantInfoTitle: "Important Information",
    backupExportedMsg: "Full backup exported successfully!",
    workHoursExportedMsg: "Work hours exported successfully!",
    restoreConfirmMsg:
      "This will restore ALL data including todos, work hours, and settings.\n\nThis action will REPLACE all current data. Are you sure?",
    restoreSuccessMsg:
      "Successfully restored backup! The page will reload to apply changes.",
    importFailedMsg: "Import failed",
    workHoursReplaceConfirm:
      "Do you want to REPLACE all current data?\n\nClick OK to replace, Cancel to merge.",
    workHoursImportedSuccess: "Work entries imported successfully",
    // ImportExcelDialog
    importExcelFile: "Import Excel File",
    importExcelDesc:
      "Import work hours data from an Excel file with Hebrew columns",
    dropExcelHere: "Drop Excel file here or click to browse",
    clickToChangeFile: "Click or drag to change file",
    supportsFormats: "Supports .xlsx and .xls files",
    importModeLabel: "Import Mode",
    mergeMode: "Merge (update existing, add new)",
    replaceMode: "Replace all data",
    clickConfirmImport: 'Click "Confirm Import" to save the data',
    confirmImport: "Confirm Import",
    parseFile: "Parse File",
    processing: "Processing...",
    // TodoTable
    colTask: "Task / Mission",
    colStatusType: "Status Type",
    noTasksFound: "No tasks found. Create your first task to get started!",
  },
  he: {
    // Nav
    tasks: "משימות",
    workHours: "שעות עבודה",
    backups: "גיבויים",
    settings: "הגדרות",
    menu: "תפריט",
    // First-visit prompt
    welcome: "!ברוך הבא",
    enterYourName: "הכנס את שמך כדי להתאים אישית את הדשבורד.",
    letsGo: "נתחיל",
    yourName: "השם שלך",
    doubleclickRename: "לחץ פעמיים לשינוי",
    // Settings dialog – sections
    appearance: "מראה",
    languageSection: "שפה",
    workHoursSettings: "הגדרות שעות עבודה",
    // Appearance settings
    displayName: "שם תצוגה",
    changeNamePlaceholder: "השם שלך",
    darkMode: "מצב כהה",
    // Language
    selectLanguage: "בחר שפה",
    english: "English (אנגלית)",
    hebrew: "עברית",
    // Work hours – day length
    workDayLength: "אורך יום עבודה",
    regularDays: "ימים רגילים (א׳–ד׳)",
    thursdayShort: "יום חמישי (יום קצר)",
    hours: "שעות",
    minutes: "דקות",
    // Work hours – calendar
    calendarSettings: "הגדרות לוח שנה",
    weekStartsOn: "השבוע מתחיל ב",
    defaultCalendarView: "תצוגת לוח שנה ברירת מחדל",
    showWeekNumbers: "הצג מספרי שבוע",
    monthView: "תצוגה חודשית",
    weekView: "תצוגה שבועית",
    sunday: "ראשון",
    monday: "שני",
    saturday: "שבת",
    // work hours – display
    displaySettings: "הגדרות תצוגה",
    timeFormat: "פורמט שעה",
    format24h: "24 שעות (14:30)",
    format12h: '12 שעות (2:30 אח"צ)',
    // Actions
    saveSettings: "שמור הגדרות",
    resetDefaults: "איפוס לברירת מחדל",
    cancel: "ביטול",
    // Todo page
    taskDashboard: "לוח משימות",
    manageTrackTasks: "נהל ועקוב אחר המשימות שלך",
    addTask: "הוסף משימה",
    totalTasks: 'סה"כ משימות',
    completedTasks: "הושלמו",
    done: "בוצע",
    activeTasks: "פעילות",
    blockedTasks: "חסומות",
    filterAll: "הכל",
    filterActive: "פעילות",
    filterCompleted: "הושלמו",
    filterBlocked: "חסומות",
    // AddTodo dialog
    addNewTask: "הוסף משימה חדשה",
    taskTitle: "כותרת המשימה",
    taskTitlePlaceholder: "הכנס כותרת למשימה",
    descriptionLabel: "תיאור",
    descriptionPlaceholder: "הכנס תיאור למשימה",
    priorityLabel: "עדיפות",
    priorityLow: "נמוכה",
    priorityMedium: "בינונית",
    priorityHigh: "גבוהה",
    statusLabel: "סטטוס",
    statusPending: "ממתין",
    statusInProgress: "בתהליך",
    statusCompleted: "הושלם",
    statusBlocked: "חסום",
    categoryLabel: "קטגוריה",
    categoryPlaceholder: "לדוג׳ Frontend, Backend",
    dueDateLabel: "תאריך יעד",
    progressLabel: "התקדמות (%)",
    submitAddTask: "הוסף משימה",
    // Work dashboard
    workHoursDashboard: "לוח שעות עבודה",
    trackWorkHours: "עקוב אחר שעות העבודה שלך",
    todayLabel: "היום",
    workDayLengthLabel: "אורך יום עבודה",
    shortDay: "יום קצר",
    regularDay: "יום רגיל",
    vacationDays: "ימי חופש",
    sickDays: "ימי מחלה",
    todaysWorkTime: "שעות עבודה היום",
    entryTimeLabel: "כניסה",
    etaExitLabel: "יציאה משוערת",
    tillEndLabel: "זמן שנותר",
    startWork: "התחל עבודה",
    endWork: "סיים עבודה",
    weekendTitle: "סוף שבוע",
    dayOffMsg: "היום יום חופש. תנוח טוב!",
    hoursSummary: "סיכום שעות",
    totalMissingHours: 'סה"כ חוסר שעות',
    workSchedule: "לוח זמנים",
    offDay: "חופש",
    calendarView: "תצוגת לוח שנה",
    tableView: "תצוגת טבלה",
    workStatistics: "סטטיסטיקות עבודה",
    totalDaysTracked: "ימים מתועדים",
    daysOnTime: "ימים בזמן",
    totalOvertime: 'סה"כ שעות נוספות',
    vacationDaysUsed: "ימי חופש שנוצלו",
    // EditTodo dialog
    editTask: "ערוך משימה",
    saveChanges: "שמור שינויים",
    // DeleteAlert
    deleteTask: "מחק משימה",
    deleteConfirmMsg:
      "האם אתה בטוח שברצונך למחוק את המשימה? פעולה זו אינה ניתנת לביטול.",
    deleteBtn: "מחק",
    // WorkDayDialog
    save: "שמור",
    requiredHoursLabel: "שעות נדרשות",
    hoursWorkedLabel: "שעות עבודה",
    overtimeLabel: "שעות עודפות",
    vacationCheckbox: "חופש",
    sickCheckbox: "מחלה",
    wfhCheckbox: "עבודה מהבית",
    entryLabel: "כניסה",
    exitLabel: "יציאה בפועל",
    notesLabel: "הערות",
    metRequirement: "עמד בדרישה",
    notMetRequirement: "לא עמד בדרישה",
    // WorkTable
    actions: "פעולות",
    noWorkDaysMsg:
      "לא תועדו ימי עבודה. לחץ על יום בלוח השנה כדי להוסיף נתונים.",
    // WorkCalendar
    monthTab: "חודש",
    weekTab: "שבוע",
    importExcel: "ייבוא מ-Excel",
    exportToExcel: "ייצוא ל-Excel",
    legendOnTime: "עמד בדרישה",
    legendLate: "לא עמד / קצר",
    legendWeekend: "סוף שבוע",
    legendVacation: "חופש",
    legendWFH: "עבודה מהבית",
    legendNote: "הערה",
    // BackupManager
    backupAndRestore: "גיבוי ושחזור",
    exportImportSafely: "ייצוא וייבוא הנתונים שלך בבטחה",
    currentDataOverview: "סקירת נתונים נוכחית",
    totalTodosLabel: 'סה"כ משימות',
    workEntriesLabel: "רשומות עבודה",
    settingsConfigured: "מוגדר",
    settingsDefault: "ברירת מחדל",
    fullSystemBackup: "גיבוי מלא של המערכת",
    fullBackupDesc: "מומלץ: ייצא הכל בקובץ אחד",
    exportFullBackup: "ייצוא גיבוי מלא",
    restoreFullBackup: "שחזור גיבוי מלא",
    workHoursOnlyTitle: "שעות עבודה בלבד",
    workHoursOnlyDesc: "ייצוא או ייבוא שעות עבודה בלבד",
    exportWorkHoursBtn: "ייצוא שעות עבודה",
    importWorkHoursBtn: "ייבוא שעות עבוה",
    importantInfoTitle: "מידע חשוב",
    backupExportedMsg: "הגיבוי המלא יוצא בהצלחה!",
    workHoursExportedMsg: "שעות העבודה יוצאו בהצלחה!",
    restoreConfirmMsg:
      "פעולה זו תשחזר את כל הנתונים כולל משימות, שעות עבודה והגדרות.\n\nפעולה זו תחליף את כל הנתונים הקיימים. האם אתה בטוח?",
    restoreSuccessMsg:
      "הגיבוי שוחזר בהצלחה! הדף יטען מחדש כדי להחיל את השינויים.",
    importFailedMsg: "הייבוא נכשל",
    workHoursReplaceConfirm:
      "האם אתה רוצה להחליף את כל הנתונים?\n\nלחץ אישור להחליף, ביטול למזג.",
    workHoursImportedSuccess: "רשומות עבודה יובאו בהצלחה",
    // ImportExcelDialog
    importExcelFile: "ייבוא קובץ Excel",
    importExcelDesc: "ייבוא נתוני שעות עבודה מקובץ Excel",
    dropExcelHere: "גרור קובץ Excel לכאן או לחץ לעיון",
    clickToChangeFile: "לחץ או גרור לשינוי הקובץ",
    supportsFormats: "תומך בקבצי .xlsx ו-.xls",
    importModeLabel: "מצב ייבוא",
    mergeMode: "מיזוג (עדכון קיים, הוספת חדש)",
    replaceMode: "החלף את כל הנתונים",
    clickConfirmImport: 'לחץ על "אשר ייבוא" לשמירת הנתונים',
    confirmImport: "אשר ייבוא",
    parseFile: "עבד קובץ",
    processing: "מעבד...", // TodoTable
    colTask: "משימה",
    colStatusType: "סוג סטאטוס",
    noTasksFound: "לא נמצאו משימות. צור את המשימה הראשונה שלך!",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

/* ─────────────────────────── context ─────────────────────────── */

interface AppSettingsContextType {
  userName: string | null;
  setUserName: (name: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(
  undefined,
);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userName, setUserName] = useLocalStorage<string | null>(
    "dashboard-user-name",
    null,
  );
  const [language, setLanguageStorage] = useLocalStorage<Language>(
    "app-language",
    "en",
  );

  const setLanguage = (lang: Language) => setLanguageStorage(lang);

  const t = (key: TranslationKey): string =>
    (translations[language] as Record<string, string>)[key] ??
    (translations.en as Record<string, string>)[key] ??
    key;

  const isRTL = language === "he";

  // Sync document direction
  useEffect(() => {
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
  }, [isRTL]);

  return (
    <AppSettingsContext.Provider
      value={{ userName, setUserName, language, setLanguage, t, isRTL }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppSettings = (): AppSettingsContextType => {
  const ctx = useContext(AppSettingsContext);
  if (!ctx)
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  return ctx;
};
