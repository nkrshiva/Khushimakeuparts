import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../services/auth/AuthService';
import { authService } from '../services/auth/AuthService';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
}

const LOCAL_ADMIN_KEY = 'platform_admin_session';

// Storage cleanup keys on logout
const LOCAL_ROLE_KEY = 'platform_admin_role';
const LOCAL_CLIENT_ID_KEY = 'platform_admin_assigned_tenant';
const LEGACY_ADMIN_KEY = 'khushi_admin_local_session';
const LEGACY_ROLE_KEY = 'khushi_admin_role';
const LEGACY_CLIENT_ID_KEY = 'khushi_admin_client_id';
const LEGACY_EMAIL_FOR_SIGN_IN_KEY = 'emailForSignIn';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Opens the Google Sign-In popup and authenticates the user via Firebase Auth.
   * Returns the raw Firebase User credential; RBAC/identity resolution is performed
   * by IdentityResolutionService upstream — this layer only authenticates, never authorizes.
   */
  const signInWithGoogle = async (): Promise<{ success: boolean; user?: User; error?: string }> => {
    if (!authService.isAvailable()) {
      return { success: false, error: 'Authentication service is unavailable. Please verify Firebase configuration.' };
    }

    try {
      const userCred = await authService.signInWithGoogle();
      setUser(userCred.user);

      try {
        localStorage.setItem(LOCAL_ADMIN_KEY, 'true');
      } catch {}

      return { success: true, user: userCred.user };
    } catch (err: any) {
      // auth/popup-closed-by-user and auth/cancelled-popup-request are normal user cancellations
      // — do not surface them as errors to the user.
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        return { success: false };
      }

      console.warn('[AuthContext] Google sign-in error code:', err?.code);

      let message = 'Google sign-in failed. Please try again.';
      if (err?.code === 'auth/popup-blocked') {
        message = 'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
      } else if (err?.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection and try again.';
      } else if (err?.code === 'auth/operation-not-allowed') {
        message = 'Google sign-in is not enabled for this platform. Please contact the platform administrator.';
      } else if (err?.code === 'auth/unauthorized-domain') {
        message = 'This domain is not authorized for Google sign-in. Please contact the platform administrator.';
      } else if (err?.code === 'auth/account-exists-with-different-credential') {
        message = 'An account already exists with a different sign-in method for this email address.';
      }

      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
    } catch (e) {
      console.warn('[AuthContext] SignOut notice', e);
    }
    setUser(null);
    try {
      localStorage.removeItem(LOCAL_ADMIN_KEY);
      localStorage.removeItem(LOCAL_ROLE_KEY);
      localStorage.removeItem(LOCAL_CLIENT_ID_KEY);
      localStorage.removeItem(LEGACY_ADMIN_KEY);
      localStorage.removeItem(LEGACY_ROLE_KEY);
      localStorage.removeItem(LEGACY_CLIENT_ID_KEY);
      localStorage.removeItem(LEGACY_EMAIL_FOR_SIGN_IN_KEY);
    } catch {}
  };

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
          try {
            localStorage.removeItem(LOCAL_ADMIN_KEY);
          } catch {}
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('[AuthContext] onAuthStateChanged listener notice:', err);
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        logout,
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
