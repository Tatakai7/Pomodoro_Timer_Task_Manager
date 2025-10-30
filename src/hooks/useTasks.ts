import { useState, useEffect } from 'react';
import { supabase, Task } from '../lib/supabase';

const getSessionId = () => {
  let sessionId = localStorage.getItem('pomodoro-session-id');
  if (!sessionId) {
    sessionId = 'pomodoro-session-' + Math.random().toString(36).substring(7);
    localStorage.setItem('pomodoro-session-id', sessionId);
  }
  return sessionId;
};

const SESSION_ID = getSessionId();

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', SESSION_ID)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addTask(title: string, timeEstimate: number) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: SESSION_ID,
            title,
            time_estimate: timeEstimate,
            time_spent: 0,
            completed: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTasks([data, ...tasks]);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  async function updateTask(id: string, updates: Partial<Task>) {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setTasks(tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async function deleteTask(id: string) {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);

      if (error) throw error;
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  async function addTimeToTask(id: string, minutes: number) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      await updateTask(id, { time_spent: task.time_spent + minutes });
    }
  }

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    addTimeToTask,
  };
}
