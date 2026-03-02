import { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { WorkDay, WorkDayEntry, WorkSummary } from '../types/workHours';
import { calculateExitTime, calculateTimeRemaining, getDayName, getDayNameEnglish, isWeekend, getDayWorkHours } from '../types/workHours';

// Helper to calculate overtime minutes
function calculateOvertimeMinutes(hoursWorked: string, requiredHours: number, requiredMinutes: number): number {
  if (!hoursWorked) return 0;
  const [h, m] = hoursWorked.split(':').map(Number);
  const workedMinutes = h * 60 + m;
  const requiredTotalMinutes = requiredHours * 60 + requiredMinutes;
  return workedMinutes - requiredTotalMinutes;
}

// Helper to calculate hours worked from entry and exit times
function calculateHoursWorked(entryTime: string, exitTime: string): string {
  if (!entryTime || !exitTime) return '';
  const [entryH, entryM] = entryTime.split(':').map(Number);
  const [exitH, exitM] = exitTime.split(':').map(Number);
  let diffMinutes = (exitH * 60 + exitM) - (entryH * 60 + entryM);
  if (diffMinutes < 0) diffMinutes += 24 * 60; // Handle overnight
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

export function useWorkHours() {
  const [workDays, setWorkDays] = useLocalStorage<WorkDay[]>('workDays', []);
  const [workDayEntries, setWorkDayEntries] = useLocalStorage<WorkDayEntry[]>('workDayEntries', []);
  const [summary, setSummary] = useLocalStorage<WorkSummary>('workSummary', {
    totalMissingHours: 0,
    vacationDays: -1.5,
    sickDays: 30.5,
    totalOvertimeHours: 0,
  });

  const [currentEntry, setCurrentEntry] = useState<string>('');
  const [currentExit, setCurrentExit] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Update time remaining every second
  useEffect(() => {
    if (currentExit) {
      const interval = setInterval(() => {
        setTimeRemaining(calculateTimeRemaining(currentExit));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentExit]);

  const setEntryTime = (time: string) => {
    setCurrentEntry(time);
    const today = new Date();
    const dayOfWeek = getDayName(today);
    const exitTime = calculateExitTime(time, dayOfWeek);
    setCurrentExit(exitTime);
  };

  // Legacy WorkDay methods (keeping for backward compatibility)
  const addWorkDay = (workDay: Omit<WorkDay, 'id'>) => {
    const newWorkDay: WorkDay = {
      ...workDay,
      id: crypto.randomUUID(),
    };
    setWorkDays([...workDays, newWorkDay]);
  };

  const updateWorkDay = (id: string, updates: Partial<WorkDay>) => {
    setWorkDays(
      workDays.map((day) => (day.id === id ? { ...day, ...updates } : day))
    );
  };

  const deleteWorkDay = (id: string) => {
    setWorkDays(workDays.filter((day) => day.id !== id));
  };

  // WorkDayEntry methods (new)
  const addWorkDayEntry = (entry: Omit<WorkDayEntry, 'id'>) => {
    const newEntry: WorkDayEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };
    setWorkDayEntries([...workDayEntries, newEntry]);
  };

  const updateWorkDayEntry = (id: string, updates: Partial<WorkDayEntry>) => {
    setWorkDayEntries(
      workDayEntries.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry))
    );
  };

  const deleteWorkDayEntry = (id: string) => {
    setWorkDayEntries(workDayEntries.filter((entry) => entry.id !== id));
  };

  const getWorkDayEntryByDate = (date: string): WorkDayEntry | undefined => {
    return workDayEntries.find((entry) => entry.date === date);
  };

  const saveOrUpdateWorkDayEntry = (entry: Omit<WorkDayEntry, 'id'> & { id?: string }) => {
    const existingEntry = entry.id 
      ? workDayEntries.find(e => e.id === entry.id)
      : getWorkDayEntryByDate(entry.date);

    if (existingEntry) {
      updateWorkDayEntry(existingEntry.id, entry);
    } else {
      addWorkDayEntry(entry as Omit<WorkDayEntry, 'id'>);
    }
  };

  // Create a WorkDayEntry from date and basic info
  const createWorkDayEntry = (
    date: Date,
    entryTime?: string,
    actualExitTime?: string,
    options: { isVacation?: boolean; isSick?: boolean; isWorkFromHome?: boolean; notes?: string } = {}
  ): Omit<WorkDayEntry, 'id'> => {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeekEnglish = getDayNameEnglish(date);
    const dayOfWeekHebrew = getDayName(date);
    const isWeekendDay = isWeekend(date);
    const { hours: reqHours, minutes: reqMinutes } = getDayWorkHours(dayOfWeekEnglish);

    let recommendedExitTime = '';
    let hoursWorked = '';
    let onTime = false;
    let overtimeMinutes = 0;

    if (entryTime && !isWeekendDay && !options.isVacation && !options.isSick) {
      recommendedExitTime = calculateExitTime(entryTime, dayOfWeekEnglish);
      
      if (actualExitTime) {
        hoursWorked = calculateHoursWorked(entryTime, actualExitTime);
        overtimeMinutes = calculateOvertimeMinutes(hoursWorked, reqHours, reqMinutes);
        onTime = overtimeMinutes >= 0;
      }
    }

    return {
      date: dateStr,
      dayOfWeek: getDayNameEnglish(date),
      dayOfWeekHebrew,
      entryTime: entryTime || '',
      recommendedExitTime,
      actualExitTime: actualExitTime || '',
      hoursWorked,
      onTime,
      timeCalculation: overtimeMinutes !== 0 ? `${overtimeMinutes > 0 ? '+' : ''}${overtimeMinutes}` : '0',
      overtimeMinutes,
      isWeekend: isWeekendDay,
      isVacation: options.isVacation || false,
      isSick: options.isSick || false,
      isWorkFromHome: options.isWorkFromHome || false,
      notes: options.notes || '',
    };
  };

  // Get entries for a specific month
  const getEntriesForMonth = (year: number, month: number): WorkDayEntry[] => {
    return workDayEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === year && entryDate.getMonth() === month;
    });
  };

  // Get entries for a specific week (starting Sunday)
  const getEntriesForWeek = (weekStartDate: Date): WorkDayEntry[] => {
    const weekEnd = new Date(weekStartDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return workDayEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStartDate && entryDate <= weekEnd;
    });
  };

  // Calculate summary stats
  const calculatedSummary = useMemo(() => {
    const totalOvertimeMinutes = workDayEntries.reduce((sum, entry) => sum + (entry.overtimeMinutes || 0), 0);
    const vacationDaysUsed = workDayEntries.filter(e => e.isVacation).length;
    const sickDaysUsed = workDayEntries.filter(e => e.isSick).length;
    const daysOnTime = workDayEntries.filter(e => e.onTime && !e.isWeekend && !e.isVacation && !e.isSick).length;
    const workDaysTotal = workDayEntries.filter(e => !e.isWeekend && !e.isVacation && !e.isSick && e.entryTime).length;

    return {
      totalOvertimeMinutes,
      totalOvertimeHours: (totalOvertimeMinutes / 60).toFixed(2),
      vacationDaysUsed,
      sickDaysUsed,
      daysOnTime,
      workDaysTotal,
      onTimePercentage: workDaysTotal > 0 ? Math.round((daysOnTime / workDaysTotal) * 100) : 0,
    };
  }, [workDayEntries]);

  const updateSummary = (updates: Partial<WorkSummary>) => {
    setSummary({ ...summary, ...updates });
  };

  const getTodayWorkDay = (): WorkDay | undefined => {
    const today = new Date().toISOString().split('T')[0];
    return workDays.find((day) => day.date === today);
  };

  const getTodayWorkDayEntry = (): WorkDayEntry | undefined => {
    const today = new Date().toISOString().split('T')[0];
    return workDayEntries.find((entry) => entry.date === today);
  };

  // Import entries from Excel (merge or replace)
  const importWorkDayEntries = (entries: WorkDayEntry[], mode: 'merge' | 'replace' = 'merge') => {
    if (mode === 'replace') {
      setWorkDayEntries(entries);
    } else {
      // Merge: update existing entries, add new ones
      const existingDates = new Map(workDayEntries.map(e => [e.date, e]));
      
      entries.forEach(entry => {
        existingDates.set(entry.date, entry);
      });
      
      setWorkDayEntries(Array.from(existingDates.values()));
    }
  };

  // Clear all entries
  const clearAllEntries = () => {
    setWorkDayEntries([]);
  };

  return {
    // Legacy
    workDays,
    addWorkDay,
    updateWorkDay,
    deleteWorkDay,
    getTodayWorkDay,
    
    // New WorkDayEntry API
    workDayEntries,
    addWorkDayEntry,
    updateWorkDayEntry,
    deleteWorkDayEntry,
    getWorkDayEntryByDate,
    saveOrUpdateWorkDayEntry,
    createWorkDayEntry,
    getEntriesForMonth,
    getEntriesForWeek,
    getTodayWorkDayEntry,
    calculatedSummary,
    importWorkDayEntries,
    clearAllEntries,
    
    // Common
    summary,
    currentEntry,
    currentExit,
    timeRemaining,
    setEntryTime,
    updateSummary,
  };
}
