// src/integrations/supabase/types.ts

// Tipo genérico usado por Supabase (por si más adelante añades Functions, etc.)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------- BRAIN ITEMS ----------

export type BrainItemType = "task" | "idea";
export type BrainItemStatus = "ACTIVE" | "DONE" | "ARCHIVED";
export type ReminderMode =
  | "NONE"
  | "ON_DUE_DATE"
  | "DAY_BEFORE_AND_DUE"
  | "DAILY_UNTIL_DUE";

export interface BrainItem {
  id: string;
  user_id: string;
  type: BrainItemType;
  title: string;
  due_date: string | null; // timestamptz -> ISO string
  reminder_mode: ReminderMode;
  status: BrainItemStatus;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
  last_notified_at: string | null; // timestamptz
}

export type BrainItemInsert = {
  id?: string;
  user_id: string;
  type: BrainItemType;
  title: string;
  due_date?: string | null;
  reminder_mode?: ReminderMode;
  status?: BrainItemStatus;
  created_at?: string;
  updated_at?: string;
  last_notified_at?: string | null;
};

export type BrainItemUpdate = Partial<BrainItem>;

// ---------- PROFILES ----------

export interface ProfileRow {
  id: string; // uuid (FK a auth.users.id)
  display_name: string | null;
  avatar_url: string | null;
  created_at: string | null; // timestamptz
  updated_at: string | null; // timestamptz
}

export type ProfileInsert = {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ProfileUpdate = {
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

// ---------- REMI_PUSH_SUBSCRIPTIONS ----------
// Basado en la captura (ajusta nullables si hace falta):

export interface RemiPushSubscriptionRow {
  id: string; // uuid
  user_id: string; // uuid (FK a auth.users.id)
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string | null; // timestamptz
  type: string | null;
  title: string | null;
  due_date: string | null; // timestamptz
  reminder_mode: string | null;
  status: string | null;
  updated_at: string | null; // timestamptz
  last_notified_at: string | null; // timestamptz
}

export type RemiPushSubscriptionInsert = {
  id?: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string | null;
  created_at?: string | null;
  type?: string | null;
  title?: string | null;
  due_date?: string | null;
  reminder_mode?: string | null;
  status?: string | null;
  updated_at?: string | null;
  last_notified_at?: string | null;
};

export type RemiPushSubscriptionUpdate = Partial<RemiPushSubscriptionRow>;

// ---------- REMI_USER_SETTINGS ----------

export interface RemiUserSettingsRow {
  user_id: string; // uuid (PK + FK)
  notifications_enabled: boolean;
  notify_day_before: boolean;
  notify_on_due_date: boolean;
  repeat_until_done: boolean;
  notification_hour_utc: number | null; // int4
  last_daily_run: string | null; // date
  created_at: string | null; // timestamptz
  updated_at: string | null; // timestamptz
}

export type RemiUserSettingsInsert = {
  user_id: string;
  notifications_enabled?: boolean;
  notify_day_before?: boolean;
  notify_on_due_date?: boolean;
  repeat_until_done?: boolean;
  notification_hour_utc?: number | null;
  last_daily_run?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type RemiUserSettingsUpdate = Partial<RemiUserSettingsRow>;

// ---------- DATABASE ROOT TYPE ----------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      brain_items: {
        Row: BrainItem;
        Insert: BrainItemInsert;
        Update: BrainItemUpdate;
        Relationships: [
          {
            foreignKeyName: "brain_items_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      remi_push_subscriptions: {
        Row: RemiPushSubscriptionRow;
        Insert: RemiPushSubscriptionInsert;
        Update: RemiPushSubscriptionUpdate;
        Relationships: [
          {
            foreignKeyName: "remi_push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      remi_user_settings: {
        Row: RemiUserSettingsRow;
        Insert: RemiUserSettingsInsert;
        Update: RemiUserSettingsUpdate;
        Relationships: [
          {
            foreignKeyName: "remi_user_settings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };

    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
