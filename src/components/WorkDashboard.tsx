import { useState, useEffect, useRef } from 'react';
import { Calendar, Coffee, Briefcase, TrendingUp, Play, Pause, CalendarDays, Table, Download, Upload, Database, Settings } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { useWorkHours } from '../hooks/useWorkHours';
import { getDayName, getDayNameEnglish, isWeekend, getDayWorkHours, formatTime, calculateExitTime, calculateTimeRemaining } from '../types/workHours';
import type { WorkDayEntry } from '../types/workHours';
import { WorkCalendar } from './WorkCalendar';
import { WorkTable } from './WorkTable';
import { WorkDayDialog } from './WorkDayDialog';
import { ImportExcelDialog } from './ImportExcelDialog';
import { WorkSettingsDialog, useWorkSettings } from './WorkSettingsDialog';
import { exportToJson, importFromJson } from '../utils/jsonExport';

export function WorkDashboard() {
  const { 
    summary, 
    updateSummary,
    workDayEntries,
    saveOrUpdateWorkDayEntry,
    deleteWorkDayEntry,
    getWorkDayEntryByDate,
    calculatedSummary,
    importWorkDayEntries,
  } = useWorkHours();
  
  const [entryTime, setEntryTime] = useState<string>('07:45');
  const [exitTime, setExitTime] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<WorkDayEntry | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const { getWorkHoursConfig, getFormattedWorkHours } = useWorkSettings();
  const workHoursConfig = getWorkHoursConfig();
  
  const today = new Date();
  const dayName = getDayName(today);
  const dayNameEnglish = getDayNameEnglish(today);
  const isWeekendDay = isWeekend(today);
  const workHours = getDayWorkHours(dayNameEnglish, workHoursConfig);

  // Calculate exit time when entry time changes
  useEffect(() => {
    if (entryTime && isWorking) {
      const calculatedExit = calculateExitTime(entryTime, dayNameEnglish, workHoursConfig);
      setExitTime(calculatedExit);
    }
  }, [entryTime, isWorking, dayNameEnglish, workHoursConfig]);

  // Update time remaining every second
  useEffect(() => {
    if (exitTime && isWorking) {
      const interval = setInterval(() => {
        setTimeRemaining(calculateTimeRemaining(exitTime));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [exitTime, isWorking]);

  const handleStartWork = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setEntryTime(currentTime);
    setIsWorking(true);
  };

  const handleStopWork = () => {
    setIsWorking(false);
    setTimeRemaining('');
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    const existing = getWorkDayEntryByDate(dateStr);
    setSelectedEntry(existing);
    setDialogOpen(true);
  };

  const handleEditEntry = (entry: WorkDayEntry) => {
    setSelectedDate(new Date(entry.date));
    setSelectedEntry(entry);
    setDialogOpen(true);
  };

  const handleSaveEntry = (entry: WorkDayEntry) => {
    saveOrUpdateWorkDayEntry(entry);
    setDialogOpen(false);
    setSelectedDate(null);
    setSelectedEntry(undefined);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteWorkDayEntry(id);
    }
  };

  const handleImport = (entries: WorkDayEntry[], mode: 'merge' | 'replace') => {
    importWorkDayEntries(entries, mode);
  };

  const handleExportJson = () => {
    exportToJson(workDayEntries, summary);
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await importFromJson(file);
    if (result.success && result.data) {
      const confirmReplace = confirm(
        `Found ${result.data.workDayEntries.length} entries from ${result.data.exportDate.split('T')[0]}.\n\nDo you want to REPLACE all current data?\n\nClick OK to replace, Cancel to merge with existing data.`
      );
      
      importWorkDayEntries(result.data.workDayEntries, confirmReplace ? 'replace' : 'merge');
      updateSummary(result.data.workSummary);
      alert(`Successfully imported ${result.data.workDayEntries.length} entries!`);
    } else {
      alert(`Import failed: ${result.error}`);
    }
    
    // Reset file input
    if (jsonFileInputRef.current) {
      jsonFileInputRef.current.value = '';
    }
  };

  const formatDateHebrew = (date: Date): string => {
    return date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Work Hours Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track your work hours and manage your time
            </p>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Settings"
          >
            <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Today's Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dayName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDateHebrew(today)}</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Work Day Length</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTime(workHours.hours, workHours.minutes)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {dayNameEnglish === 'Thursday' ? 'Short day' : 'Regular day'}
                </p>
              </div>
              <Briefcase className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vacation Days</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.vacationDays}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">חופש</p>
              </div>
              <Coffee className={`h-10 w-10 ${summary.vacationDays < 0 ? 'text-red-500' : 'text-purple-500'}`} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sick Days</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.sickDays}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">ימי מחלה</p>
              </div>
              <TrendingUp className="h-10 w-10 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Work Time Tracker */}
        {!isWeekendDay ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Today's Work Time</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Entry Time */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  כניסה (Entry)
                </label>
                <input
                  type="time"
                  value={entryTime}
                  onChange={(e) => setEntryTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-lg"
                />
              </div>

              {/* Exit Time */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  יציאה משוערת (ETA Exit)
                </label>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {exitTime || '--:--'}
                </div>
              </div>

              {/* Time Remaining */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  עד סוף היום נשאר (Till End)
                </label>
                <div className={`text-3xl font-bold ${timeRemaining === '0:00' ? 'text-green-600' : 'text-orange-600 dark:text-orange-400'}`}>
                  {timeRemaining || '--:--:--'}
                </div>
              </div>

              {/* Start/Stop Button */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center">
                {!isWorking ? (
                  <button
                    onClick={handleStartWork}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Play className="h-5 w-5" />
                    Start Work
                  </button>
                ) : (
                  <button
                    onClick={handleStopWork}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Pause className="h-5 w-5" />
                    End Work
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <Coffee className="h-8 w-8 text-yellow-600" />
              <div>
                <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">שבת - Weekend</h2>
                <p className="text-yellow-700 dark:text-yellow-300">Today is a day off. Enjoy your rest!</p>
              </div>
            </div>
          </div>
        )}

        {/* Hours Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Hours Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">סה"כ חוסר שעות</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Missing Hours</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <input
                  type="number"
                  step="0.5"
                  value={summary.totalMissingHours}
                  onChange={(e) => updateSummary({ totalMissingHours: parseFloat(e.target.value) || 0 })}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-center text-xl font-bold"
                />
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">חופש</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Vacation Days</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <input
                  type="number"
                  step="0.5"
                  value={summary.vacationDays}
                  onChange={(e) => updateSummary({ vacationDays: parseFloat(e.target.value) || 0 })}
                  className={`w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 text-center text-xl font-bold ${
                    summary.vacationDays < 0 
                      ? 'border-red-300 text-red-600 dark:text-red-400' 
                      : 'border-gray-300 dark:border-gray-600 dark:text-white'
                  }`}
                />
              </div>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">ימי מחלה</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sick Days</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <input
                  type="number"
                  step="0.5"
                  value={summary.sickDays}
                  onChange={(e) => updateSummary({ sickDays: parseFloat(e.target.value) || 0 })}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-center text-xl font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Work Schedule Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Work Schedule</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'].map((day) => {
              const isThursday = day === 'חמישי';
              const isFriday = day === 'שישי';
              const isToday = day === dayName;
              
              return (
                <div
                  key={day}
                  className={`p-4 rounded-lg text-center ${
                    isToday
                      ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                      : isFriday
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <p className="font-medium text-gray-900 dark:text-white">{day}</p>
                  <p className={`text-sm ${isFriday ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {isFriday ? 'Off' : getFormattedWorkHours(isThursday)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar/Table View Tabs */}
        <Tabs.Root defaultValue="calendar" className="mb-8">
          <Tabs.List className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <Tabs.Trigger
              value="calendar"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-colors"
            >
              <CalendarDays className="h-4 w-4" />
              Calendar View
            </Tabs.Trigger>
            <Tabs.Trigger
              value="table"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-colors"
            >
              <Table className="h-4 w-4" />
              Table View
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="calendar">
            <WorkCalendar 
              workDays={workDayEntries}
              onDayClick={handleDayClick}
              onImportClick={() => setImportDialogOpen(true)}
            />
          </Tabs.Content>

          <Tabs.Content value="table">
            <WorkTable
              workDays={workDayEntries}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          </Tabs.Content>
        </Tabs.Root>

        {/* Work Day Dialog */}
        {selectedDate && (
          <WorkDayDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            date={selectedDate}
            entry={selectedEntry}
            onSave={handleSaveEntry}
          />
        )}

        {/* Import Excel Dialog */}
        <ImportExcelDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onImport={handleImport}
        />

        {/* Settings Dialog */}
        <WorkSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />

        {/* Backup & Restore */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Backup & Restore</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Export your data to a JSON file to backup or transfer to another computer.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              Export to JSON
            </button>
            
            <label className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors cursor-pointer">
              <Upload className="h-4 w-4" />
              Import from JSON
              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
            Data is stored locally in your browser. Use these options to backup or move data between computers.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Work Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Days Tracked</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{calculatedSummary.workDaysTotal}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Days On Time</p>
              <p className="text-2xl font-bold text-green-600">{calculatedSummary.daysOnTime}</p>
              <p className="text-xs text-gray-500">{calculatedSummary.onTimePercentage}%</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Overtime</p>
              <p className={`text-2xl font-bold ${calculatedSummary.totalOvertimeMinutes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {calculatedSummary.totalOvertimeHours}h
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Vacation Days Used</p>
              <p className="text-2xl font-bold text-purple-600">{calculatedSummary.vacationDaysUsed}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
