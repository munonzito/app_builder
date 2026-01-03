import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, displayName?: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setIsInitialized(true);
    });
    return unsubscribe;
  }, []);

  const getErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/user-not-found':
        return 'No user found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'Email is already registered';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      default:
        return 'Authentication failed';
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[Auth] Attempting sign in for:', email);
      await authService.signInWithEmail(email, password);
      console.log('[Auth] Sign in successful');
      setIsLoading(false);
      return true;
    } catch (e: any) {
      console.log('[Auth] Sign in error:', e);
      console.log('[Auth] Error code:', e.code);
      console.log('[Auth] Error message:', e.message);
      setError(getErrorMessage(e.code));
      setIsLoading(false);
      return false;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[Auth] Attempting sign up for:', email);
      await authService.signUpWithEmail(email, password);
      if (displayName) {
        await authService.updateDisplayName(displayName);
      }
      console.log('[Auth] Sign up successful');
      setIsLoading(false);
      return true;
    } catch (e: any) {
      console.log('[Auth] Sign up error:', e);
      console.log('[Auth] Error code:', e.code);
      console.log('[Auth] Error message:', e.message);
      setError(getErrorMessage(e.code));
      setIsLoading(false);
      return false;
    }
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.sendPasswordReset(email);
      setIsLoading(false);
      return true;
    } catch (e: any) {
      setError(getErrorMessage(e.code));
      setIsLoading(false);
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    await authService.signOut();
  };

  const clearError = () => {
    setError(null);
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        signIn,
        signUp,
        sendPasswordReset,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
