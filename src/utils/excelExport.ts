import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { WorkDayEntry } from '../types/workHours';

// Hebrew day name mapping
const hebrewDayToEnglish: Record<string, string> = {
  'ראשון': 'Sunday',
  'שני': 'Monday',
  'שלישי': 'Tuesday',
  'רביעי': 'Wednesday',
  'חמישי': 'Thursday',
  'שישי': 'Friday',
  'שבת': 'Saturday',
};
//comment123
// Parse time string in various formats (HH:MM, H:MM, HH:MM:SS AM/PM)
const parseTimeString = (timeStr: string): string => {
  if (!timeStr || timeStr === '') return '';
  
  // Remove any extra spaces
  timeStr = timeStr.toString().trim();
  
  // Handle AM/PM format (e.g., "9:06:00 AM")
  const amPmMatch = timeStr.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
  if (amPmMatch) {
    let hours = parseInt(amPmMatch[1], 10);
    const minutes = amPmMatch[2];
    const amPm = amPmMatch[3]?.toUpperCase();
    
    if (amPm === 'PM' && hours !== 12) {
      hours += 12;
    } else if (amPm === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  // Handle simple HH:MM format
  const simpleMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (simpleMatch) {
    return `${simpleMatch[1].padStart(2, '0')}:${simpleMatch[2]}`;
  }
  
  return '';
};

// Parse date string in DD/MM/YYYY format
const parseDateString = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Handle DD/MM/YYYY format
  const match = dateStr.toString().match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3];
    return `${year}-${month}-${day}`;
  }
  
  // Try to parse as date object
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  return '';
};

// Parse hours worked string (H:MM or HH:MM format)
const parseHoursWorked = (hoursStr: string): string => {
  if (!hoursStr || hoursStr === '0:00') return '';
  return hoursStr.toString().trim();
};

// Check if day is weekend based on Hebrew day name
const isWeekendDay = (dayHebrew: string): boolean => {
  return dayHebrew === 'שבת' || dayHebrew === 'שישי';
};

// Parse overtime minutes from חישוב זמן column
const parseOvertimeMinutes = (value: string | number): number => {
  if (!value) return 0;
  const numValue = typeof value === 'number' ? value : parseFloat(value.toString());
  if (isNaN(numValue)) return 0;
  return Math.round(numValue);
};

export interface ImportResult {
  success: boolean;
  entries: WorkDayEntry[];
  errors: string[];
  totalImported: number;
}

export const importFromExcel = (file: File): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
        
        if (jsonData.length < 2) {
          resolve({
            success: false,
            entries: [],
            errors: ['No data found in Excel file'],
            totalImported: 0,
          });
          return;
        }
        
        // Find header row (look for תאריך)
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(5, jsonData.length); i++) {
          const row = jsonData[i] as string[];
          if (row && row.some(cell => cell?.toString().includes('תאריך'))) {
            headerRowIndex = i;
            break;
          }
        }
        
        const headers = jsonData[headerRowIndex] as string[];
        const entries: WorkDayEntry[] = [];
        const errors: string[] = [];
        
        // Map column indices
        const colMap: Record<string, number> = {};
        headers.forEach((header, index) => {
          if (header) {
            const headerStr = header.toString().trim();
            if (headerStr.includes('תאריך')) colMap['date'] = index;
            else if (headerStr.includes('יום')) colMap['day'] = index;
            else if (headerStr === 'כניסה') colMap['entry'] = index;
            else if (headerStr.includes('יציאה מומלצת')) colMap['recommendedExit'] = index;
            else if (headerStr.includes('יציאה בפועל')) colMap['actualExit'] = index;
            else if (headerStr.includes('כמה זמן עבדתי')) colMap['hoursWorked'] = index;
            else if (headerStr.includes('עמדתי בזמן')) colMap['onTime'] = index;
            else if (headerStr.includes('חישוב זמן')) colMap['timeCalc'] = index;
          }
        });
        
        // Process data rows
        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const row = jsonData[i] as (string | number)[];
          if (!row || row.length === 0) continue;
          
          // Skip summary rows (rows without a valid date)
          const dateValue = row[colMap['date']];
          if (!dateValue) continue;
          
          const dateStr = parseDateString(dateValue.toString());
          if (!dateStr) continue;
          
          const dayHebrew = row[colMap['day']]?.toString() || '';
          const dayEnglish = hebrewDayToEnglish[dayHebrew] || dayHebrew;
          const isWeekend = isWeekendDay(dayHebrew);
          
          const entryTime = parseTimeString(row[colMap['entry']]?.toString() || '');
          const recommendedExitTime = parseTimeString(row[colMap['recommendedExit']]?.toString() || '');
          const actualExitTime = parseTimeString(row[colMap['actualExit']]?.toString() || '');
          const hoursWorked = parseHoursWorked(row[colMap['hoursWorked']]?.toString() || '');
          
          const onTimeValue = row[colMap['onTime']]?.toString() || '';
          const onTime = onTimeValue.includes('עמד בדרישה') && !onTimeValue.includes('לא עמד');
          
          const overtimeMinutes = parseOvertimeMinutes(row[colMap['timeCalc']]);
          
          const entry: WorkDayEntry = {
            id: crypto.randomUUID(),
            date: dateStr,
            dayOfWeek: dayEnglish,
            dayOfWeekHebrew: dayHebrew,
            entryTime,
            recommendedExitTime,
            actualExitTime,
            hoursWorked,
            onTime: isWeekend ? false : onTime,
            timeCalculation: overtimeMinutes.toString(),
            overtimeMinutes,
            notes: '',
            isWeekend,
            isVacation: false,
            isSick: false,
            isWorkFromHome: false,
          };
          
          entries.push(entry);
        }
        
        resolve({
          success: true,
          entries,
          errors,
          totalImported: entries.length,
        });
        
      } catch (error) {
        resolve({
          success: false,
          entries: [],
          errors: [`Failed to parse Excel file: ${error}`],
          totalImported: 0,
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        entries: [],
        errors: ['Failed to read file'],
        totalImported: 0,
      });
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const exportToExcel = (data: WorkDayEntry[], filename: string = 'work-hours') => {
  // Prepare data for Excel
  const excelData = data.map((day) => ({
    'תאריך': day.date,
    'יום': day.dayOfWeekHebrew || day.dayOfWeek,
    'כניסה': day.entryTime || '',
    'יציאה מומלצת': day.recommendedExitTime || '',
    'יציאה בפועל': day.actualExitTime || '',
    'כמה זמן עבדתי': day.hoursWorked || '',
    'עמדתי בזמן או לא': day.isWeekend ? 'שבת' : (day.onTime ? 'עמד בדרישה' : 'לא עמד בדרישה'),
    'חישוב זמן': day.overtimeMinutes || 0,
    'הערות': day.notes || '',
  }));

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Work Hours');

  // Set column widths
  const colWidths = [
    { wch: 12 }, // תאריך
    { wch: 8 },  // יום
    { wch: 8 },  // כניסה
    { wch: 12 }, // יציאה מומלצת
    { wch: 12 }, // יציאה בפועל
    { wch: 12 }, // כמה זמן עבדתי
    { wch: 15 }, // עמדתי בזמן או לא
    { wch: 12 }, // חישוב זמן
    { wch: 20 }, // הערות
  ];
  worksheet['!cols'] = colWidths;

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save file
  const dateStr = new Date().toISOString().split('T')[0];
  saveAs(blob, `${filename}-${dateStr}.xlsx`);
};

export const exportMonthToExcel = (data: WorkDayEntry[], month: number, year: number) => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  exportToExcel(data, `work-hours-${monthNames[month]}-${year}`);
};

export const exportWeekToExcel = (data: WorkDayEntry[], weekStart: Date) => {
  const dateStr = weekStart.toISOString().split('T')[0];
  exportToExcel(data, `work-hours-week-${dateStr}`);
};
