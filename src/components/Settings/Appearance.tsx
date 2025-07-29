import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Theme } from '../../types';

const Appearance: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      id: 'light' as Theme,
      label: 'Light',
      description: 'Light theme for bright environments',
      icon: Sun
    },
    {
      id: 'dark' as Theme,
      label: 'Dark',
      description: 'Dark theme for low-light environments',
      icon: Moon
    },
    {
      id: 'auto' as Theme,
      label: 'Auto',
      description: 'Automatically switch based on system preference',
      icon: Monitor
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Appearance Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize the look and feel of the application
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Theme Preference
        </h3>
        <div className="grid gap-4">
          {themeOptions.map(option => {
            const Icon = option.icon;
            const isSelected = theme === option.id;
            
            return (
              <label
                key={option.id}
                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={option.id}
                  checked={isSelected}
                  onChange={(e) => setTheme(e.target.value as Theme)}
                  className="sr-only"
                />
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Appearance;