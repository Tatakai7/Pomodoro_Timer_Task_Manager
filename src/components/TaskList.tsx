import { useState } from 'react';
import { Plus, Trash2, Check, Clock, Play, Edit2 } from 'lucide-react';
import { Task } from '../lib/supabase';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (title: string, timeEstimate: number) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  activeTask: Task | null;
  onSetActiveTask: (task: Task | null) => void;
}

export function TaskList({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  activeTask,
  onSetActiveTask,
}: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEstimate, setNewTaskEstimate] = useState(25);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editEstimate, setEditEstimate] = useState(25);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim(), newTaskEstimate);
      setNewTaskTitle('');
      setNewTaskEstimate(25);
      setShowAddForm(false);
    }
  };

  const toggleComplete = (task: Task) => {
    onUpdateTask(task.id, { completed: !task.completed });
    if (activeTask?.id === task.id) {
      onSetActiveTask(null);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
    setEditEstimate(task.time_estimate);
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditTitle('');
    setEditEstimate(25);
  };

  const saveEdit = () => {
    if (editingTask && editTitle.trim()) {
      onUpdateTask(editingTask, {
        title: editTitle.trim(),
        time_estimate: editEstimate,
      });
      cancelEditing();
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tasks</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          aria-label={showAddForm ? "Close add task form" : "Add new task"}
        >
          <Plus size={20} />
          Add Task
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddTask} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="mb-3">
            <label htmlFor="new-task-title" className="sr-only">
              Task Title
            </label>
            <input
              id="new-task-title"
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <label htmlFor="new-task-estimate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Estimated Time:
            </label>
            <input
              id="new-task-estimate"
              type="number"
              value={newTaskEstimate}
              onChange={(e) => setNewTaskEstimate(parseInt(e.target.value) || 25)}
              min="5"
              step="5"
              className="w-20 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Add Task
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewTaskTitle('');
                setNewTaskEstimate(25);
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {activeTasks.length === 0 && completedTasks.length === 0 && (
          <div className="text-center py-12">
            <Clock size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No tasks yet. Add one to get started!</p>
          </div>
        )}

        {activeTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Active Tasks
            </h3>
            {activeTasks.map((task) => (
              <div
                key={task.id}
                className={`group p-4 mb-3 rounded-xl border-2 transition-all ${
                  activeTask?.id === task.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {editingTask === task.id ? (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor={`edit-title-${task.id}`} className="sr-only">
                        Edit Task Title
                      </label>
                      <input
                        id={`edit-title-${task.id}`}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label htmlFor={`edit-estimate-${task.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Estimate:
                      </label>
                      <input
                        id={`edit-estimate-${task.id}`}
                        type="number"
                        value={editEstimate}
                        onChange={(e) => setEditEstimate(parseInt(e.target.value) || 25)}
                        min="5"
                        step="5"
                        className="w-20 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleComplete(task)}
                      className="mt-1 flex-shrink-0 w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                      aria-label={`Mark "${task.title}" as complete`}
                    />
                    <div className="flex-grow">
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                        {task.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Est: {formatTime(task.time_estimate)}
                        </span>
                        {task.time_spent > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            Spent: {formatTime(task.time_spent)}
                          </span>
                        )}
                        {task.time_spent > 0 && task.time_estimate > 0 && (
                          <div className="flex-grow max-w-xs">
                            <div 
                              className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2"
                            >
                              <div
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.min((task.time_spent / task.time_estimate) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeTask?.id === task.id ? (
                        <button
                          onClick={() => onSetActiveTask(null)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                          aria-label={`Stop working on "${task.title}"`}
                        >
                          Active
                        </button>
                      ) : (
                        <button
                          onClick={() => onSetActiveTask(task)}
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors flex items-center gap-1"
                          aria-label={`Start working on "${task.title}"`}
                        >
                          <Play size={14} />
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => startEditing(task)}
                        className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label={`Edit "${task.title}"`}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label={`Delete "${task.title}"`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="pt-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Completed ({completedTasks.length})
            </h3>
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="group p-4 mb-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border-2 border-gray-200 dark:border-gray-600 opacity-60 hover:opacity-100 transition-all"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleComplete(task)}
                    className="mt-1 flex-shrink-0 w-5 h-5 rounded bg-green-500 border-2 border-green-500 hover:bg-green-600 transition-colors flex items-center justify-center"
                    aria-label={`Mark "${task.title}" as incomplete`}
                  >
                    <Check size={14} className="text-white" />
                  </button>
                  <div className="flex-grow">
                    <h4 className="font-medium text-gray-600 dark:text-gray-400 line-through mb-2">
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-500">
                      <span>Time spent: {formatTime(task.time_spent)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label={`Delete "${task.title}"`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}