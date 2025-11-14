// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type User, type Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

export type Profile =
  Database["public"]["Tables"]["profiles"]["Row"]; // ← tipo real de la tabla

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (
    updates: Partial<Pick<Profile, "display_name" | "avatar_url">>
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

  // Cargar sesión inicial
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar / crear perfil
  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      let current = data as Profile | null;

      if (error) {
        console.error("Error fetching profile", error);
      }

      // Si no existe perfil, lo creamos
      if (!current) {
        const defaultName = user.email ? user.email.split("@")[0] : null;

        const { data: inserted, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            display_name: defaultName,
            avatar_url: null,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error inserting profile", insertError);
          return;
        }

        current = inserted as Profile;
      }

      setProfile(current);
    } catch (err) {
      console.error("Unexpected error loading profile", err);
    }
  };

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    void refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Actualizar perfil (nombre / avatar_url)
  const updateProfile = async (
    updates: Partial<Pick<Profile, "display_name" | "avatar_url">>
  ) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile", error);
      return;
    }

    setProfile(data as Profile);
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        profile,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
