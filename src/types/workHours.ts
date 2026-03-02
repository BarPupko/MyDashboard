export interface WorkDay {
  id: string;
  date: string;
  dayOfWeek: string;
  entryTime: string;
  actualExitTime: string;
  recommendedExitTime: string;
  hoursWorked: string;
  onTime: boolean;
  timeCalculation: string;
  notes: string;
}

export interface WorkDayEntry {
  id: string;
  date: string;
  dayOfWeek: string;
  dayOfWeekHebrew: string;
  entryTime: string;
  recommendedExitTime: string;
  actualExitTime: string;
  hoursWorked: string;
  onTime: boolean;
  timeCalculation: string;
  overtimeMinutes: number;
  notes: string;
  isWeekend: boolean;
  isVacation: boolean;
  isSick: boolean;
  isWorkFromHome: boolean;
}

export interface WorkSummary {
  totalMissingHours: number;
  vacationDays: number;
  sickDays: number;
  totalOvertimeHours: number;
}

export interface WorkHoursConfig {
  regularHours: number;
  regularMinutes: number;
  thursdayHours: number;
  thursdayMinutes: number;
}

export const WORK_HOURS = {
  regular: { hours: 9, minutes: 6 }, // 9:06 for regular days
  thursday: { hours: 8, minutes: 6 }, // 8:06 for Thursday
};

export const getDayWorkHours = (dayOfWeek: string, config?: WorkHoursConfig): { hours: number; minutes: number } => {
  if (dayOfWeek === 'Thursday' || dayOfWeek === 'חמישי') {
    return config 
      ? { hours: config.thursdayHours, minutes: config.thursdayMinutes }
      : WORK_HOURS.thursday;
  }
  return config 
    ? { hours: config.regularHours, minutes: config.regularMinutes }
    : WORK_HOURS.regular;
};

export const formatTime = (hours: number, minutes: number): string => {
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

export const calculateExitTime = (entryTime: string, dayOfWeek: string, config?: WorkHoursConfig): string => {
  const [entryHours, entryMinutes] = entryTime.split(':').map(Number);
  const workHours = getDayWorkHours(dayOfWeek, config);
  
  let exitMinutes = entryMinutes + workHours.minutes;
  let exitHours = entryHours + workHours.hours;
  
  if (exitMinutes >= 60) {
    exitHours += Math.floor(exitMinutes / 60);
    exitMinutes = exitMinutes % 60;
  }
  
  return formatTime(exitHours, exitMinutes);
};

export const calculateTimeRemaining = (exitTime: string): string => {
  const now = new Date();
  const [exitHours, exitMinutes] = exitTime.split(':').map(Number);
  
  const exitDate = new Date();
  exitDate.setHours(exitHours, exitMinutes, 0, 0);
  
  const diff = exitDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return '0:00';
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const getDayName = (date: Date): string => {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return days[date.getDay()];
};

export const getDayNameEnglish = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday or Saturday
};
