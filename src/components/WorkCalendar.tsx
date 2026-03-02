import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Download, Clock, Upload, Home, StickyNote } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Tooltip from '@radix-ui/react-tooltip';
import type { WorkDayEntry } from '../types/workHours';
import { getDayName, isWeekend as checkIsWeekend } from '../types/workHours';
import { exportMonthToExcel, exportWeekToExcel } from '../utils/excelExport';

interface WorkCalendarProps {
  workDays: WorkDayEntry[];
  onDayClick: (date: Date) => void;
  onImportClick?: () => void;
}

export function WorkCalendar({ workDays, onDayClick, onImportClick }: WorkCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 
                        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

  // Get start of week (Sunday)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
  };

  // Get days for the current view
  const getDaysInView = useMemo(() => {
    const days: Date[] = [];
    
    if (viewMode === 'month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Add padding days from previous month
      const startPadding = firstDay.getDay();
      for (let i = startPadding - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        days.push(d);
      }
      
      // Add days of current month
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
      }
      
      // Add padding days from next month
      const endPadding = 42 - days.length; // 6 weeks * 7 days
      for (let i = 1; i <= endPadding; i++) {
        days.push(new Date(year, month + 1, i));
      }
    } else {
      const weekStart = getWeekStart(currentDate);
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        days.push(d);
      }
    }
    
    return days;
  }, [currentDate, viewMode]);

  // Get work data for a specific date
  const getWorkDataForDate = (date: Date): WorkDayEntry | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    return workDays.find(d => d.date === dateStr);
  };

  // Navigation
  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Export handlers
  const handleExport = () => {
    if (viewMode === 'month') {
      const monthDays = getDaysInView.filter(d => d.getMonth() === currentDate.getMonth());
      const monthData = monthDays.map(date => {
        const existing = getWorkDataForDate(date);
        return existing || createEmptyDayEntry(date);
      });
      exportMonthToExcel(monthData, currentDate.getMonth(), currentDate.getFullYear());
    } else {
      const weekData = getDaysInView.map(date => {
        const existing = getWorkDataForDate(date);
        return existing || createEmptyDayEntry(date);
      });
      exportWeekToExcel(weekData, getDaysInView[0]);
    }
  };

  const createEmptyDayEntry = (date: Date): WorkDayEntry => {
    const dayName = getDayName(date);
    const isWeekendDay = checkIsWeekend(date);
    return {
      id: crypto.randomUUID(),
      date: date.toISOString().split('T')[0],
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()],
      dayOfWeekHebrew: dayName,
      entryTime: '',
      recommendedExitTime: '',
      actualExitTime: '',
      hoursWorked: isWeekendDay ? '0:00' : '',
      onTime: false,
      timeCalculation: isWeekendDay ? '-9:06' : '',
      overtimeMinutes: 0,
      notes: isWeekendDay ? 'שבת' : '',
      isWeekend: isWeekendDay,
      isVacation: false,
      isSick: false,
      isWorkFromHome: false,
    };
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getStatusColor = (workDay: WorkDayEntry | undefined, date: Date): string => {
    if (!workDay) {
      if (checkIsWeekend(date)) return 'bg-gray-100 dark:bg-gray-800';
      return 'bg-white dark:bg-gray-900';
    }
    
    if (workDay.isWeekend) return 'bg-gray-100 dark:bg-gray-800';
    if (workDay.isVacation) return 'bg-purple-50 dark:bg-purple-900/20';
    if (workDay.isSick) return 'bg-orange-50 dark:bg-orange-900/20';
    
    if (workDay.entryTime && workDay.actualExitTime) {
      return workDay.onTime 
        ? 'bg-green-50 dark:bg-green-900/20' 
        : 'bg-red-50 dark:bg-red-900/20';
    }
    
    return 'bg-white dark:bg-gray-900';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {hebrewMonths[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={navigatePrev}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={navigateNext}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <Tabs.Root value={viewMode} onValueChange={(v) => setViewMode(v as 'month' | 'week')}>
              <Tabs.List className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <Tabs.Trigger
                  value="month"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm"
                >
                  <Calendar className="h-4 w-4" />
                  Month
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="week"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm"
                >
                  <Clock className="h-4 w-4" />
                  Week
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>

            {/* Import Button */}
            {onImportClick && (
              <button
                onClick={onImportClick}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Upload className="h-4 w-4" />
                Import Excel
              </button>
            )}

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              Export to Excel
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className={`grid ${viewMode === 'month' ? 'grid-cols-7' : 'grid-cols-7'} gap-1`}>
          {hebrewDays.map((day, index) => (
            <div
              key={day}
              className={`text-center py-2 text-sm font-medium ${
                index === 5 || index === 6 
                  ? 'text-gray-400 dark:text-gray-500' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={`p-4 grid ${viewMode === 'month' ? 'grid-cols-7' : 'grid-cols-7'} gap-1`}>
        {getDaysInView.map((date, index) => {
          const workDay = getWorkDataForDate(date);
          const isWeekendDay = checkIsWeekend(date);
          const inCurrentMonth = viewMode === 'month' ? isCurrentMonth(date) : true;
          
          return (
            <div
              key={index}
              onClick={() => !isWeekendDay && onDayClick(date)}
              className={`
                ${viewMode === 'month' ? 'min-h-[100px]' : 'min-h-[200px]'}
                p-2 border border-gray-200 dark:border-gray-700 rounded-lg
                ${getStatusColor(workDay, date)}
                ${!inCurrentMonth ? 'opacity-40' : ''}
                ${isToday(date) ? 'ring-2 ring-blue-500' : ''}
                ${!isWeekendDay ? 'cursor-pointer hover:shadow-md' : ''}
                transition-shadow
              `}
            >
              {/* Date */}
              <div className={`text-sm font-medium mb-1 ${
                isToday(date) 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : isWeekendDay 
                    ? 'text-gray-400' 
                    : 'text-gray-900 dark:text-white'
              }`}>
                {date.getDate()}
              </div>

              {/* Work Data */}
              {workDay && !isWeekendDay && (
                <div className="text-xs space-y-1">
                  {workDay.entryTime && (
                    <div className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">כניסה:</span> {workDay.entryTime}
                    </div>
                  )}
                  {workDay.actualExitTime && (
                    <div className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">יציאה:</span> {workDay.actualExitTime}
                    </div>
                  )}
                  {workDay.hoursWorked && (
                    <div className={`font-medium ${
                      workDay.onTime ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {workDay.hoursWorked}
                    </div>
                  )}
                  {workDay.overtimeMinutes !== 0 && (
                    <div className={`text-xs ${
                      workDay.overtimeMinutes > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {workDay.overtimeMinutes > 0 ? '+' : ''}{workDay.overtimeMinutes} min
                    </div>
                  )}
                  
                  {/* Icons row */}
                  <div className="flex items-center gap-1 mt-1">
                    {workDay.isWorkFromHome && (
                      <Tooltip.Provider delayDuration={200}>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <div className="p-1 bg-blue-100 dark:bg-blue-900/40 rounded">
                              <Home className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              className="bg-gray-900 text-white px-2 py-1 rounded text-xs shadow-lg"
                              sideOffset={5}
                            >
                              עבודה מהבית
                              <Tooltip.Arrow className="fill-gray-900" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                    )}
                    
                    {workDay.notes && (
                      <Tooltip.Provider delayDuration={200}>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <div className="p-1 bg-yellow-100 dark:bg-yellow-900/40 rounded">
                              <StickyNote className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                            </div>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              className="bg-gray-900 text-white px-3 py-2 rounded text-xs shadow-lg max-w-[200px]"
                              sideOffset={5}
                            >
                              {workDay.notes}
                              <Tooltip.Arrow className="fill-gray-900" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                    )}
                  </div>
                </div>
              )}

              {isWeekendDay && (
                <div className="text-xs text-gray-400 mt-2">שבת</div>
              )}

              {workDay?.isVacation && (
                <div className="text-xs text-purple-600 font-medium">חופש</div>
              )}

              {workDay?.isSick && (
                <div className="text-xs text-orange-600 font-medium">מחלה</div>
              )}

              {workDay?.isWorkFromHome && !workDay?.entryTime && (
                <div className="flex items-center gap-1 text-xs text-blue-600 font-medium mt-1">
                  <Home className="h-3 w-3" /> עבודה מהבית
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded border border-green-300"></div>
            <span className="text-gray-600 dark:text-gray-400">עמד בדרישה (On Time)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded border border-red-300"></div>
            <span className="text-gray-600 dark:text-gray-400">לא עמד בדרישה (Late/Short)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300"></div>
            <span className="text-gray-600 dark:text-gray-400">שבת (Weekend)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900/30 rounded border border-purple-300"></div>
            <span className="text-gray-600 dark:text-gray-400">חופש (Vacation)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded border border-blue-300 flex items-center justify-center">
              <Home className="h-2.5 w-2.5 text-blue-600" />
            </div>
            <span className="text-gray-600 dark:text-gray-400">עבודה מהבית (WFH)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-300 flex items-center justify-center">
              <StickyNote className="h-2.5 w-2.5 text-yellow-600" />
            </div>
            <span className="text-gray-600 dark:text-gray-400">הערה (Note)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
