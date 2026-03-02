import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Clock, Moon, Sun } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';
import { useTheme } from './ThemeProvider';

export function Navigation() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', label: 'Tasks', icon: CheckSquare },
    { path: '/dashboard', label: 'Work Hours', icon: Clock },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Bar's Popko Dashboard</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-700 pl-4">
              <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <Switch.Root
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full relative data-[state=checked]:bg-blue-600 transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
              <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
