
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("AuthProvider: Initializing auth state");
    
    // Initialize session from supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("AuthProvider: Initial session:", session ? "exists" : "none");
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("AuthProvider: Auth state changed:", event, session ? "session exists" : "no session");
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch profile when user exists
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user?.id]);

  async function fetchProfile() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("AuthContext: Attempting sign in for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("AuthContext: Sign in error:", error);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log("AuthContext: Sign in successful:", data.user?.email);
      return { error: null };
    } catch (error: any) {
      console.error("AuthContext: Sign in exception:", error);
      toast({
        title: "Login error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      console.log("AuthContext: Attempting sign up for:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        console.error("AuthContext: Sign up error:", error);
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log("AuthContext: Sign up successful. Email confirmation required:", data.user?.email);
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account.",
      });

      return { error: null };
    } catch (error: any) {
      console.error("AuthContext: Sign up exception:", error);
      toast({
        title: "Registration error",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    console.log("AuthContext: Signing out");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("AuthContext: Sign out error:", error);
        toast({
          title: "Logout error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log("AuthContext: Sign out successful, session cleared");
        toast({
          title: "Logged out",
          description: "You have been successfully logged out",
        });
        
        // Clear local state
        setSession(null);
        setUser(null);
        setProfile(null);
        
        // Force a page reload to clear any cached state
        window.location.href = "/login";
      }
    } catch (error: any) {
      console.error("AuthContext: Sign out exception:", error);
      toast({
        title: "Logout error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
