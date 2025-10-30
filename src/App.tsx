import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PomodoroTimer } from './components/PomodoroTimer';
import { TaskList } from './components/TaskList';
import { Statistics } from './components/Statistics';
import { useTasks } from './hooks/useTasks';
import { useDarkMode } from './hooks/useDarkMode';
import { requestNotificationPermission } from './utils/sounds';
import { Task } from './lib/supabase';

function App() {
  const { tasks, loading, addTask, updateTask, deleteTask, addTimeToTask } = useTasks();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [sessionsCompleted, setSessionsCompleted] = useState(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('pomodoro-sessions');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === today) {
        return data.count;
      }
    }
    return 0;
  });

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const handleSessionComplete = (minutes: number) => {
    if (activeTask) {
      addTimeToTask(activeTask.id, minutes);
    }
    const today = new Date().toDateString();
    const saved = localStorage.getItem('pomodoro-sessions');
    let count = 1;
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === today) {
        count = data.count + 1;
      }
    }
    setSessionsCompleted(count);
  };

  const handleSetActiveTask = (task: Task | null) => {
    setActiveTask(task);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Header isDark={isDark} toggleDarkMode={toggleDarkMode} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Statistics tasks={tasks} sessionsCompleted={sessionsCompleted} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="order-2 lg:order-1">
            <TaskList
              tasks={tasks}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              activeTask={activeTask}
              onSetActiveTask={handleSetActiveTask}
            />
          </div>

          <div className="order-1 lg:order-2 lg:sticky lg:top-8 h-fit">
            <PomodoroTimer
              onSessionComplete={handleSessionComplete}
              activeTask={activeTask}
            />
          </div>
        </div>

        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            How to use Focus Flow
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Add Tasks</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create tasks with time estimates to organize your work
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">2</span>
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Focus Sessions</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Work in 25-minute focused intervals with 5-minute breaks
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">3</span>
              </div>
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Track Progress</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor your time spent and completed tasks
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600 dark:text-gray-400">
        <p className="text-sm">
           © 2025 All rights reserved. To God be all the glory.
        </p>
      </footer>
    </div>
  );
}

export default App;
