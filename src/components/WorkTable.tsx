import { Edit2, Trash2, Home, StickyNote } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import type { WorkDayEntry } from '../types/workHours';

interface WorkTableProps {
  workDays: WorkDayEntry[];
  onEdit: (workDay: WorkDayEntry) => void;
  onDelete: (id: string) => void;
}

export function WorkTable({ workDays, onEdit, onDelete }: WorkTableProps) {
  // Sort by date descending
  const sortedDays = [...workDays].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-blue-600 dark:bg-blue-700">
            <tr>
              <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                תאריך
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                יום
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                כניסה
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                יציאה מומלצת
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                יציאה בפועל
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                כמה זמן עבדתי
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                עמדתי בזמן או לא
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                חישוב זמן
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                הערות
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider w-20">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedDays.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No work days recorded. Click on a day in the calendar to add data.
                </td>
              </tr>
            ) : (
              sortedDays.map((day) => (
                <tr 
                  key={day.id} 
                  className={`
                    hover:bg-gray-50 dark:hover:bg-gray-800
                    ${day.isWeekend ? 'bg-gray-100 dark:bg-gray-800' : ''}
                    ${day.isVacation ? 'bg-purple-50 dark:bg-purple-900/20' : ''}
                    ${day.isSick ? 'bg-orange-50 dark:bg-orange-900/20' : ''}
                    ${day.isWorkFromHome ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
                  `}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {formatDate(day.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      {day.dayOfWeekHebrew}
                      {day.isWorkFromHome && (
                        <Tooltip.Provider delayDuration={200}>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <div className="p-1 bg-blue-100 dark:bg-blue-900/40 rounded">
                                <Home className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              </div>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                              <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-xs shadow-lg" sideOffset={5}>
                                עבודה מהבית
                                <Tooltip.Arrow className="fill-gray-900" />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {day.entryTime || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {day.recommendedExitTime || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {day.actualExitTime || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {day.hoursWorked || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {day.isWeekend ? (
                      <span className="text-gray-400 text-sm">שבת</span>
                    ) : day.isVacation ? (
                      <span className="text-purple-600 text-sm font-medium">חופש</span>
                    ) : day.isSick ? (
                      <span className="text-orange-600 text-sm font-medium">מחלה</span>
                    ) : day.entryTime && day.actualExitTime ? (
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        day.onTime 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {day.onTime ? 'עמד בדרישה' : 'לא עמד בדרישה'}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${
                    day.overtimeMinutes > 0 
                      ? 'text-green-600' 
                      : day.overtimeMinutes < 0 
                        ? 'text-red-600' 
                        : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {day.overtimeMinutes !== 0 ? `${day.overtimeMinutes > 0 ? '+' : ''}${day.overtimeMinutes}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[150px]">
                    {day.notes ? (
                      <Tooltip.Provider delayDuration={200}>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <div className="flex items-center gap-1 cursor-help">
                              <StickyNote className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                              <span className="truncate">{day.notes}</span>
                            </div>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content className="bg-gray-900 text-white px-3 py-2 rounded text-xs shadow-lg max-w-[300px] whitespace-pre-wrap" sideOffset={5}>
                              {day.notes}
                              <Tooltip.Arrow className="fill-gray-900" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(day)}
                        className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(day.id)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Row */}
      {sortedDays.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
          <div className="flex justify-end gap-8 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Total Overtime:</span>
              <span className={`ml-2 font-bold ${
                sortedDays.reduce((sum, d) => sum + (d.overtimeMinutes || 0), 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {(() => {
                  const totalMinutes = sortedDays.reduce((sum, d) => sum + (d.overtimeMinutes || 0), 0);
                  const hours = Math.floor(Math.abs(totalMinutes) / 60);
                  const mins = Math.abs(totalMinutes) % 60;
                  return `${totalMinutes >= 0 ? '+' : '-'}${hours}:${mins.toString().padStart(2, '0')}`;
                })()}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">שעות נוספות (Extra Hours):</span>
              <span className="ml-2 font-bold text-gray-900 dark:text-white">
                {(sortedDays.reduce((sum, d) => sum + (d.overtimeMinutes || 0), 0) / 60).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
