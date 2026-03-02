import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { WorkDayEntry } from '../types/workHours';
import { getDayName, getDayNameEnglish, calculateExitTime, getDayWorkHours, formatTime } from '../types/workHours';
import { useWorkSettings } from './WorkSettingsDialog';

interface WorkDayDialogProps {
  date: Date | null;
  entry?: WorkDayEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (workDay: WorkDayEntry) => void;
}

export function WorkDayDialog({ date, entry, open, onOpenChange, onSave }: WorkDayDialogProps) {
  const { getWorkHoursConfig } = useWorkSettings();
  const workHoursConfig = getWorkHoursConfig();
  
  const [formData, setFormData] = useState<Partial<WorkDayEntry>>({
    entryTime: '',
    actualExitTime: '',
    notes: '',
    isVacation: false,
    isSick: false,
    isWorkFromHome: false,
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        entryTime: entry.entryTime || '',
        actualExitTime: entry.actualExitTime || '',
        notes: entry.notes || '',
        isVacation: entry.isVacation || false,
        isSick: entry.isSick || false,
        isWorkFromHome: entry.isWorkFromHome || false,
      });
    } else if (date) {
      setFormData({
        entryTime: '',
        actualExitTime: '',
        notes: '',
        isVacation: false,
        isSick: false,
        isWorkFromHome: false,
      });
    }
  }, [entry, date]);

  if (!date) return null;

  const dayName = getDayName(date);
  const dayNameEnglish = getDayNameEnglish(date);
  const workHours = getDayWorkHours(dayNameEnglish, workHoursConfig);
  const requiredHours = formatTime(workHours.hours, workHours.minutes);

  const calculateHoursWorked = (): { hours: string; onTime: boolean; overtimeMinutes: number } => {
    if (!formData.entryTime || !formData.actualExitTime) {
      return { hours: '', onTime: false, overtimeMinutes: 0 };
    }

    const [entryH, entryM] = formData.entryTime.split(':').map(Number);
    const [exitH, exitM] = formData.actualExitTime.split(':').map(Number);

    const entryMinutes = entryH * 60 + entryM;
    const exitMinutes = exitH * 60 + exitM;
    const workedMinutes = exitMinutes - entryMinutes;

    const requiredMinutes = workHours.hours * 60 + workHours.minutes;
    const overtimeMinutes = workedMinutes - requiredMinutes;

    const hours = Math.floor(workedMinutes / 60);
    const minutes = workedMinutes % 60;

    return {
      hours: `${hours}:${minutes.toString().padStart(2, '0')}`,
      onTime: workedMinutes >= requiredMinutes,
      overtimeMinutes,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { hours, onTime, overtimeMinutes } = calculateHoursWorked();
    const recommendedExit = formData.entryTime ? calculateExitTime(formData.entryTime, dayNameEnglish, workHoursConfig) : '';

    const newEntry: WorkDayEntry = {
      id: entry?.id || crypto.randomUUID(),
      date: date.toISOString().split('T')[0],
      dayOfWeek: dayNameEnglish,
      dayOfWeekHebrew: dayName,
      entryTime: formData.entryTime || '',
      recommendedExitTime: recommendedExit,
      actualExitTime: formData.actualExitTime || '',
      hoursWorked: hours,
      onTime,
      timeCalculation: overtimeMinutes !== 0 ? `${overtimeMinutes > 0 ? '+' : ''}${overtimeMinutes}` : '0',
      overtimeMinutes,
      notes: formData.notes || '',
      isWeekend: false,
      isVacation: formData.isVacation || false,
      isSick: formData.isSick || false,
      isWorkFromHome: formData.isWorkFromHome || false,
    };

    onSave(newEntry);
    onOpenChange(false);
  };

  const formatDateHebrew = (d: Date): string => {
    return d.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const { hours: calculatedHours, onTime, overtimeMinutes } = calculateHoursWorked();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {dayName} - {formatDateHebrew(date)}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Required hours: {requiredHours}
          </Dialog.Description>
          <Dialog.Close className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </Dialog.Close>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Day Type */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isVacation}
                  onChange={(e) => setFormData({ ...formData, isVacation: e.target.checked, isSick: false })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">חופש (Vacation)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isSick}
                  onChange={(e) => setFormData({ ...formData, isSick: e.target.checked, isVacation: false })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">מחלה (Sick)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isWorkFromHome}
                  onChange={(e) => setFormData({ ...formData, isWorkFromHome: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">עבודה מהבית (WFH)</span>
              </label>
            </div>

            {!formData.isVacation && !formData.isSick && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      כניסה (Entry)
                    </label>
                    <input
                      type="time"
                      value={formData.entryTime}
                      onChange={(e) => setFormData({ ...formData, entryTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      יציאה בפועל (Exit)
                    </label>
                    <input
                      type="time"
                      value={formData.actualExitTime}
                      onChange={(e) => setFormData({ ...formData, actualExitTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Calculated Values */}
                {calculatedHours && (
                  <div className={`p-4 rounded-lg ${onTime ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Hours Worked:</span>
                        <span className={`ml-2 font-bold ${onTime ? 'text-green-600' : 'text-red-600'}`}>
                          {calculatedHours}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span className={`ml-2 font-bold ${onTime ? 'text-green-600' : 'text-red-600'}`}>
                          {onTime ? 'עמד בדרישה' : 'לא עמד בדרישה'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Overtime:</span>
                        <span className={`ml-2 font-bold ${overtimeMinutes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {overtimeMinutes > 0 ? '+' : ''}{overtimeMinutes} min
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                הערות (Notes)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={2}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
