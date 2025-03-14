
import React, { createContext, useContext } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { AuthContextType } from "@/contexts/auth/types";
import { useAuthState } from "@/contexts/auth/useAuthState";
import { signIn as authSignIn, signUp as authSignUp, signOut as authSignOut } from "@/contexts/auth/authActions";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { session, user, profile, isLoading, setSession, setUser, setProfile } = useAuthState();
  const { toast } = useToast();
  const navigate = useNavigate();

  const signIn = async (email: string, password: string) => {
    const { error } = await authSignIn(email, password);
    
    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const { error } = await authSignUp(email, password, firstName, lastName);
    
    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account.",
      });
    }
    
    return { error };
  };

  const signOut = async () => {
    try {
      const { error } = await authSignOut();
      
      if (error) {
        toast({
          title: "Logout error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out",
        });
        
        // Clear local state
        setSession(null);
        setUser(null);
        setProfile(null);
        
        // Navigate to login page instead of using window.location
        // This preserves the React app context
        navigate("/login");
      }
    } catch (error: any) {
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
