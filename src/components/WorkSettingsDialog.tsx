import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { X, Settings, ChevronDown, Check } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface WorkHoursSettings {
  regularDayHours: number;
  regularDayMinutes: number;
  thursdayHours: number;
  thursdayMinutes: number;
  weekStartDay: 0 | 1 | 6; // 0 = Sunday, 1 = Monday, 6 = Saturday
  weekendDays: number[]; // [5, 6] = Friday, Saturday
  showWeekNumbers: boolean;
  defaultView: 'month' | 'week';
  timeFormat: '24h' | '12h';
}

const defaultSettings: WorkHoursSettings = {
  regularDayHours: 9,
  regularDayMinutes: 6,
  thursdayHours: 8,
  thursdayMinutes: 6,
  weekStartDay: 0,
  weekendDays: [5, 6], // Friday, Saturday (Israeli weekend)
  showWeekNumbers: false,
  defaultView: 'month',
  timeFormat: '24h',
};

interface WorkSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

import type { WorkHoursConfig } from '../types/workHours';

export function useWorkSettings() {
  const [settings, setSettings] = useLocalStorage<WorkHoursSettings>('workHoursSettings', defaultSettings);
  
  const updateSettings = (updates: Partial<WorkHoursSettings>) => {
    setSettings({ ...settings, ...updates });
  };

  // Convert settings to WorkHoursConfig format for calculation functions
  const getWorkHoursConfig = (): WorkHoursConfig => ({
    regularHours: settings.regularDayHours,
    regularMinutes: settings.regularDayMinutes,
    thursdayHours: settings.thursdayHours,
    thursdayMinutes: settings.thursdayMinutes,
  });

  // Get formatted work hours for display
  const getFormattedWorkHours = (isThursday: boolean): string => {
    if (isThursday) {
      return `${settings.thursdayHours}:${settings.thursdayMinutes.toString().padStart(2, '0')}`;
    }
    return `${settings.regularDayHours}:${settings.regularDayMinutes.toString().padStart(2, '0')}`;
  };

  return { settings, updateSettings, defaultSettings, getWorkHoursConfig, getFormattedWorkHours };
}

export function WorkSettingsDialog({ open, onOpenChange }: WorkSettingsDialogProps) {
  const { settings, updateSettings } = useWorkSettings();
  const [localSettings, setLocalSettings] = useState<WorkHoursSettings>(settings);

  useEffect(() => {
    if (open) {
      setLocalSettings(settings);
    }
  }, [open, settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalSettings(defaultSettings);
  };

  const weekDays = [
    { value: '0', label: 'ראשון (Sunday)' },
    { value: '1', label: 'שני (Monday)' },
    { value: '6', label: 'שבת (Saturday)' },
  ];

  const viewOptions = [
    { value: 'month', label: 'Month View' },
    { value: 'week', label: 'Week View' },
  ];

  const timeFormatOptions = [
    { value: '24h', label: '24 Hour (14:30)' },
    { value: '12h', label: '12 Hour (2:30 PM)' },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto z-50">
          <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Work Hours Settings
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Customize your work schedule and display preferences
          </Dialog.Description>

          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="h-5 w-5" />
            </button>
          </Dialog.Close>

          <div className="space-y-6">
            {/* Work Day Length Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                📅 Work Day Length
              </h3>
              
              {/* Regular Days */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Regular Days (Sun-Wed)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={localSettings.regularDayHours}
                    onChange={(e) => setLocalSettings({ ...localSettings, regularDayHours: parseInt(e.target.value) || 0 })}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center"
                  />
                  <span className="text-gray-600 dark:text-gray-400">hours</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={localSettings.regularDayMinutes}
                    onChange={(e) => setLocalSettings({ ...localSettings, regularDayMinutes: parseInt(e.target.value) || 0 })}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center"
                  />
                  <span className="text-gray-600 dark:text-gray-400">minutes</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Current: {localSettings.regularDayHours}:{localSettings.regularDayMinutes.toString().padStart(2, '0')}
                </p>
              </div>

              {/* Thursday */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Thursday (Short Day)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={localSettings.thursdayHours}
                    onChange={(e) => setLocalSettings({ ...localSettings, thursdayHours: parseInt(e.target.value) || 0 })}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center"
                  />
                  <span className="text-gray-600 dark:text-gray-400">hours</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={localSettings.thursdayMinutes}
                    onChange={(e) => setLocalSettings({ ...localSettings, thursdayMinutes: parseInt(e.target.value) || 0 })}
                    className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center"
                  />
                  <span className="text-gray-600 dark:text-gray-400">minutes</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Current: {localSettings.thursdayHours}:{localSettings.thursdayMinutes.toString().padStart(2, '0')}
                </p>
              </div>
            </div>

            {/* Calendar Settings Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                🗓️ Calendar Settings
              </h3>

              {/* Week Start Day */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Week Starts On
                </label>
                <Select.Root 
                  value={localSettings.weekStartDay.toString()} 
                  onValueChange={(value) => setLocalSettings({ ...localSettings, weekStartDay: parseInt(value) as 0 | 1 | 6 })}
                >
                  <Select.Trigger className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white flex items-center justify-between">
                    <Select.Value />
                    <Select.Icon>
                      <ChevronDown className="h-4 w-4" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[100]">
                      <Select.Viewport className="p-1">
                        {weekDays.map((day) => (
                          <Select.Item
                            key={day.value}
                            value={day.value}
                            className="px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer flex items-center justify-between"
                          >
                            <Select.ItemText>{day.label}</Select.ItemText>
                            <Select.ItemIndicator>
                              <Check className="h-4 w-4 text-blue-600" />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>

              {/* Default View */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Default Calendar View
                </label>
                <Select.Root 
                  value={localSettings.defaultView} 
                  onValueChange={(value) => setLocalSettings({ ...localSettings, defaultView: value as 'month' | 'week' })}
                >
                  <Select.Trigger className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white flex items-center justify-between">
                    <Select.Value />
                    <Select.Icon>
                      <ChevronDown className="h-4 w-4" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[100]">
                      <Select.Viewport className="p-1">
                        {viewOptions.map((option) => (
                          <Select.Item
                            key={option.value}
                            value={option.value}
                            className="px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer flex items-center justify-between"
                          >
                            <Select.ItemText>{option.label}</Select.ItemText>
                            <Select.ItemIndicator>
                              <Check className="h-4 w-4 text-blue-600" />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>

              {/* Show Week Numbers */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showWeekNumbers}
                    onChange={(e) => setLocalSettings({ ...localSettings, showWeekNumbers: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show Week Numbers</span>
                </label>
              </div>
            </div>

            {/* Display Settings Section */}
            <div className="pb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                ⚙️ Display Settings
              </h3>

              {/* Time Format */}
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Time Format
                </label>
                <Select.Root 
                  value={localSettings.timeFormat} 
                  onValueChange={(value) => setLocalSettings({ ...localSettings, timeFormat: value as '24h' | '12h' })}
                >
                  <Select.Trigger className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white flex items-center justify-between">
                    <Select.Value />
                    <Select.Icon>
                      <ChevronDown className="h-4 w-4" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[100]">
                      <Select.Viewport className="p-1">
                        {timeFormatOptions.map((option) => (
                          <Select.Item
                            key={option.value}
                            value={option.value}
                            className="px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer flex items-center justify-between"
                          >
                            <Select.ItemText>{option.label}</Select.ItemText>
                            <Select.ItemIndicator>
                              <Check className="h-4 w-4 text-blue-600" />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Reset to Defaults
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
