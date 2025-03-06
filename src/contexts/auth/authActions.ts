
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

export async function signIn(email: string, password: string) {
  try {
    console.log("AuthContext: Attempting sign in for:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("AuthContext: Sign in error:", error);
      return { error };
    }

    console.log("AuthContext: Sign in successful:", data.user?.email);
    return { error: null };
  } catch (error: any) {
    console.error("AuthContext: Sign in exception:", error);
    return { error };
  }
}

export async function signUp(email: string, password: string, firstName: string, lastName: string) {
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
      return { error };
    }

    console.log("AuthContext: Sign up successful. Email confirmation required:", data.user?.email);
    return { error: null };
  } catch (error: any) {
    console.error("AuthContext: Sign up exception:", error);
    return { error };
  }
}

export async function signOut() {
  console.log("AuthContext: Signing out");
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("AuthContext: Sign out error:", error);
      return { error };
    } else {
      console.log("AuthContext: Sign out successful, session cleared");
      return { error: null };
    }
  } catch (error: any) {
    console.error("AuthContext: Sign out exception:", error);
    return { error };
  }
}
