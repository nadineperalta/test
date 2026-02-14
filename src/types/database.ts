import type { Recurrence } from "./recurrence";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          name: string;
          category: string;
          frequency_per_week: number;
          selected_days: string[] | null;
          recurrence: Recurrence | null;
          xp_reward: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          frequency_per_week?: number;
          selected_days?: string[] | null;
          recurrence?: Recurrence | null;
          xp_reward?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          frequency_per_week?: number;
          selected_days?: string[] | null;
          recurrence?: Recurrence | null;
          xp_reward?: number;
          created_at?: string;
        };
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          completion_date: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          completion_date: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          completion_date?: string;
        };
      };
    };
  };
}

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitInsert = Database["public"]["Tables"]["habits"]["Insert"];
export type HabitCompletion = Database["public"]["Tables"]["habit_completions"]["Row"];
export type HabitCompletionInsert = Database["public"]["Tables"]["habit_completions"]["Insert"];
