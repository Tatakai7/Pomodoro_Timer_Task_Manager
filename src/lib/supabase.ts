import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Task {
  id: string;
  user_id: string | null;
  title: string;
  time_estimate: number;
  time_spent: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
