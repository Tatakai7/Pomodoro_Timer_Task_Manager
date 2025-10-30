import { TrendingUp, Target, CheckCircle2, Clock } from 'lucide-react';
import { Task } from '../lib/supabase';

interface StatisticsProps {
  tasks: Task[];
  sessionsCompleted: number;
}

export function Statistics({ tasks, sessionsCompleted }: StatisticsProps) {
  const completedTasks = tasks.filter((t) => t.completed);
  const totalTimeSpent = tasks.reduce((sum, task) => sum + task.time_spent, 0);
  const activeTasks = tasks.filter((t) => !t.completed);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const completionRate = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  const stats = [
    {
      icon: Clock,
      label: 'Sessions Today',
      value: sessionsCompleted,
      color: 'blue',
      suffix: sessionsCompleted === 1 ? 'session' : 'sessions',
    },
    {
      icon: TrendingUp,
      label: 'Time Focused',
      value: formatTime(totalTimeSpent),
      color: 'cyan',
      suffix: 'total',
    },
    {
      icon: CheckCircle2,
      label: 'Tasks Completed',
      value: completedTasks.length,
      color: 'green',
      suffix: `of ${tasks.length}`,
    },
    {
      icon: Target,
      label: 'Completion Rate',
      value: `${completionRate}%`,
      color: 'purple',
      suffix: 'overall',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Your Statistics
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
            green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
            purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
          }[stat.color];

          return (
            <div
              key={stat.label}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${colorClasses}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {stat.suffix}
              </div>
            </div>
          );
        })}
      </div>

      {activeTasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{activeTasks.length}</span> active task
            {activeTasks.length !== 1 ? 's' : ''} remaining with{' '}
            <span className="font-semibold">
              {formatTime(activeTasks.reduce((sum, t) => sum + (t.time_estimate - t.time_spent), 0))}
            </span>{' '}
            estimated time left
          </div>
        </div>
      )}
    </div>
  );
}
