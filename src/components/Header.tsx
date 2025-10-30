import { Moon, Sun, Timer } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  toggleDarkMode: () => void;
}

export function Header({ isDark, toggleDarkMode }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Timer className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Focus Flow
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Master your time, achieve your goals
              </p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all transform hover:scale-105"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="text-yellow-500" size={20} />
            ) : (
              <Moon className="text-gray-700" size={20} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
