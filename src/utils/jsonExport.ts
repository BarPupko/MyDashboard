import type { WorkDayEntry, WorkSummary } from '../types/workHours';
import type { Todo } from '../types/todo';

export interface WorkHoursSettings {
  regularDayHours: number;
  regularDayMinutes: number;
  thursdayHours: number;
  thursdayMinutes: number;
  weekStartDay: 0 | 1 | 6;
  weekendDays: number[];
  showWeekNumbers: boolean;
  defaultView: 'month' | 'week';
  timeFormat: '24h' | '12h';
}

export interface FullExportedData {
  version: string;
  exportDate: string;
  todos: Todo[];
  workDayEntries: WorkDayEntry[];
  workSummary: WorkSummary;
  workHoursSettings?: WorkHoursSettings;
  theme?: 'light' | 'dark';
}

// Legacy interface for backward compatibility
export interface ExportedData {
  version: string;
  exportDate: string;
  workDayEntries: WorkDayEntry[];
  workSummary: WorkSummary;
}

// Export all app data including settings
export const exportAllDataToJson = () => {
  const data: FullExportedData = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    todos: JSON.parse(localStorage.getItem('todos') || '[]'),
    workDayEntries: JSON.parse(localStorage.getItem('workDayEntries') || '[]'),
    workSummary: JSON.parse(localStorage.getItem('workSummary') || '{"totalMissingHours":0,"vacationDays":0,"sickDays":0,"totalOvertimeHours":0}'),
    workHoursSettings: JSON.parse(localStorage.getItem('workHoursSettings') || 'null'),
    theme: localStorage.getItem('theme') as 'light' | 'dark' || 'light',
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `todo-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Export work hours only (for backward compatibility)
export const exportToJson = (workDayEntries: WorkDayEntry[], workSummary: WorkSummary) => {
  const data: ExportedData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    workDayEntries,
    workSummary,
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `work-hours-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export interface ImportResult {
  success: boolean;
  data?: ExportedData;
  error?: string;
}

export interface FullImportResult {
  success: boolean;
  data?: FullExportedData;
  error?: string;
  itemsImported?: {
    todos: number;
    workDayEntries: number;
    settings: boolean;
    theme: boolean;
  };
}

// Import all app data
export const importAllDataFromJson = (file: File): Promise<FullImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as FullExportedData;
        
        // Check if it's a full backup (version 2.0) or legacy format
        if (data.version === '2.0') {
          // Validate full backup structure
          if (!data.todos || !Array.isArray(data.todos)) {
            resolve({
              success: false,
              error: 'Invalid file format: missing todos array',
            });
            return;
          }
          
          if (!data.workDayEntries || !Array.isArray(data.workDayEntries)) {
            resolve({
              success: false,
              error: 'Invalid file format: missing workDayEntries array',
            });
            return;
          }
          
          if (!data.workSummary) {
            resolve({
              success: false,
              error: 'Invalid file format: missing workSummary',
            });
            return;
          }
          
          // Import all data to localStorage
          localStorage.setItem('todos', JSON.stringify(data.todos));
          localStorage.setItem('workDayEntries', JSON.stringify(data.workDayEntries));
          localStorage.setItem('workSummary', JSON.stringify(data.workSummary));
          
          if (data.workHoursSettings) {
            localStorage.setItem('workHoursSettings', JSON.stringify(data.workHoursSettings));
          }
          
          if (data.theme) {
            localStorage.setItem('theme', data.theme);
            // Trigger theme update
            document.documentElement.classList.toggle('dark', data.theme === 'dark');
          }
          
          resolve({
            success: true,
            data,
            itemsImported: {
              todos: data.todos.length,
              workDayEntries: data.workDayEntries.length,
              settings: !!data.workHoursSettings,
              theme: !!data.theme,
            },
          });
        } else {
          // Legacy format - only work hours
          const legacyData = data as ExportedData;
          if (!legacyData.workDayEntries || !Array.isArray(legacyData.workDayEntries)) {
            resolve({
              success: false,
              error: 'Invalid file format: missing workDayEntries array',
            });
            return;
          }
          
          if (!legacyData.workSummary) {
            resolve({
              success: false,
              error: 'Invalid file format: missing workSummary',
            });
            return;
          }
          
          localStorage.setItem('workDayEntries', JSON.stringify(legacyData.workDayEntries));
          localStorage.setItem('workSummary', JSON.stringify(legacyData.workSummary));
          
          resolve({
            success: true,
            data: {
              ...legacyData,
              todos: [],
              version: '1.0',
            },
            itemsImported: {
              todos: 0,
              workDayEntries: legacyData.workDayEntries.length,
              settings: false,
              theme: false,
            },
          });
        }
      } catch (error) {
        resolve({
          success: false,
          error: `Failed to parse JSON: ${error}`,
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to read file',
      });
    };
    
    reader.readAsText(file);
  });
};

// Legacy import for backward compatibility
export const importFromJson = (file: File): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as ExportedData;
        
        // Validate the data structure
        if (!data.workDayEntries || !Array.isArray(data.workDayEntries)) {
          resolve({
            success: false,
            error: 'Invalid file format: missing workDayEntries array',
          });
          return;
        }
        
        if (!data.workSummary) {
          resolve({
            success: false,
            error: 'Invalid file format: missing workSummary',
          });
          return;
        }
        
        resolve({
          success: true,
          data,
        });
      } catch (error) {
        resolve({
          success: false,
          error: `Failed to parse JSON: ${error}`,
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to read file',
      });
    };
    
    reader.readAsText(file);
  });
};
