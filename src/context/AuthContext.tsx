import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../services/auth/AuthService';
import { authService } from '../services/auth/AuthService';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const LOCAL_ADMIN_KEY = 'platform_admin_session';
const LEGACY_ADMIN_KEY = 'khushi_admin_local_session';

// Storage cleanup keys on logout
const LOCAL_ROLE_KEY = 'platform_admin_role';
const LOCAL_CLIENT_ID_KEY = 'platform_admin_assigned_tenant';
const LEGACY_ROLE_KEY = 'khushi_admin_role';
const LEGACY_CLIENT_ID_KEY = 'khushi_admin_client_id';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.isAvailable()) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = authService.onAuthStateChanged(async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          try {
            localStorage.setItem(LOCAL_ADMIN_KEY, 'true');
          } catch {}
        } else {
          // If no active Firebase Auth session, ensure local storage session flag is cleared
          try {
            localStorage.removeItem(LOCAL_ADMIN_KEY);
          } catch {}
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('onAuthStateChanged listener notice:', err);
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Please provide both email and password.' };
    }

    // 1. Primary: Authenticate via AuthService
    if (authService.isAvailable()) {
      try {
        const userCred = await authService.signIn(cleanEmail, cleanPass);

        setUser(userCred.user);

        try {
          localStorage.setItem(LOCAL_ADMIN_KEY, 'true');
        } catch {}

        return { success: true };
      } catch (firebaseErr: any) {
        console.warn('Firebase login error code:', firebaseErr?.code);

        // Friendly, user-understandable error messages
        let message = 'Invalid email or password. Please verify your credentials.';
        if (firebaseErr?.code === 'auth/user-not-found' || firebaseErr?.code === 'auth/wrong-password' || firebaseErr?.code === 'auth/invalid-credential') {
          message = 'Incorrect email or password. Please check your details or reset your password.';
        } else if (firebaseErr?.code === 'auth/too-many-requests') {
          message = 'Access temporarily disabled due to multiple failed login attempts. Please reset your password or try again later.';
        } else if (firebaseErr?.code === 'auth/invalid-email') {
          message = 'Please enter a valid email address.';
        } else if (firebaseErr?.code === 'auth/network-request-failed') {
          message = 'Network error. Please check your internet connection.';
        }

        return {
          success: false,
          error: message,
        };
      }
    }

    return {
      success: false,
      error: 'Authentication service is unavailable. Please check your Firebase configuration.',
    };
  };

  // Self-service password reset email
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address to reset password.' };
    }

    if (!authService.isAvailable()) {
      return { success: false, error: 'Firebase Auth is not initialized.' };
    }

    try {
      await authService.sendPasswordResetEmail(cleanEmail);
      return { success: true };
    } catch (err: any) {
      console.warn('Password reset notice:', err);
      let message = 'Failed to send password reset email. Please verify the address.';
      if (err?.code === 'auth/user-not-found') {
        message = 'No registered admin found with this email address.';
      } else if (err?.code === 'auth/invalid-email') {
        message = 'Please provide a valid email format.';
      }
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
    } catch (e) {
      console.warn('SignOut notice', e);
    }
    setUser(null);
    try {
      localStorage.removeItem(LOCAL_ADMIN_KEY);
      localStorage.removeItem(LOCAL_ROLE_KEY);
      localStorage.removeItem(LOCAL_CLIENT_ID_KEY);
      localStorage.removeItem(LEGACY_ADMIN_KEY);
      localStorage.removeItem(LEGACY_ROLE_KEY);
      localStorage.removeItem(LEGACY_CLIENT_ID_KEY);
    } catch {}
  };

  const isAdmin = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        login,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
