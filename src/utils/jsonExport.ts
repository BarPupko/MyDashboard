import type { WorkDayEntry, WorkSummary } from '../types/workHours';

export interface ExportedData {
  version: string;
  exportDate: string;
  workDayEntries: WorkDayEntry[];
  workSummary: WorkSummary;
}

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
