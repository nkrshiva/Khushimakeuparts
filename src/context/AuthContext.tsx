import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { isBootstrapDeveloperEmail, PLATFORM_BOOTSTRAP_DEVELOPER_EMAILS } from '../config/adminCredentials';

export type AdminRole = 'developer' | 'client' | null;

export interface UserProfile {
  uid: string;
  email: string;
  role: 'developer' | 'client';
  assignedClientId?: string;
  displayName?: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  role: AdminRole;
  isDeveloper: boolean;
  assignedClientId: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const LOCAL_ADMIN_KEY = 'platform_admin_session';
const LOCAL_ROLE_KEY = 'platform_admin_role';
const LOCAL_CLIENT_ID_KEY = 'platform_admin_assigned_tenant';

const LEGACY_ADMIN_KEY = 'khushi_admin_local_session';
const LEGACY_ROLE_KEY = 'khushi_admin_role';
const LEGACY_CLIENT_ID_KEY = 'khushi_admin_client_id';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [localAdmin, setLocalAdmin] = useState<boolean>(() => {
    try {
      const val = localStorage.getItem(LOCAL_ADMIN_KEY) || localStorage.getItem(LEGACY_ADMIN_KEY);
      return val === 'true';
    } catch {
      return false;
    }
  });
  const [role, setRole] = useState<AdminRole>(() => {
    try {
      return ((localStorage.getItem(LOCAL_ROLE_KEY) || localStorage.getItem(LEGACY_ROLE_KEY)) as AdminRole) || null;
    } catch {
      return null;
    }
  });
  const [assignedClientId, setAssignedClientId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOCAL_CLIENT_ID_KEY) || localStorage.getItem(LEGACY_CLIENT_ID_KEY) || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync role and assigned tenant from Firestore or custom claims
  const resolveUserRoleAndTenant = async (currentUser: User): Promise<{
    role: AdminRole;
    assignedClientId: string | null;
  }> => {
    const email = currentUser.email?.toLowerCase() || '';

    // 1. Query Firestore user profile for role and assigned tenant mapping
    if (db) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          const resolvedRole: AdminRole = data?.role === 'developer' ? 'developer' : 'client';
          const tenantId = resolvedRole === 'developer' ? null : (data?.assignedClientId || null);
          return { role: resolvedRole, assignedClientId: tenantId };
        }
      } catch (err) {
        console.warn('Could not read user profile from Firestore:', err);
      }
    }

    // 2. Check if email is in the optional platform bootstrap developer list
    if (isBootstrapDeveloperEmail(email)) {
      if (db) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            email,
            role: 'developer',
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (err) {
          console.warn('Developer bootstrap sync notice:', err);
        }
      }
      return { role: 'developer', assignedClientId: null };
    }

    // 3. Fallback: unassigned client role
    return { role: 'client', assignedClientId: null };
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          const { role: resolvedRole, assignedClientId: resolvedTenant } = await resolveUserRoleAndTenant(currentUser);
          setRole(resolvedRole);
          setAssignedClientId(resolvedTenant);
          setLocalAdmin(true);

          try {
            localStorage.setItem(LOCAL_ADMIN_KEY, 'true');
            if (resolvedRole) localStorage.setItem(LOCAL_ROLE_KEY, resolvedRole);
            if (resolvedTenant) {
              localStorage.setItem(LOCAL_CLIENT_ID_KEY, resolvedTenant);
            } else {
              localStorage.removeItem(LOCAL_CLIENT_ID_KEY);
            }
          } catch {}
        } else {
          // If no active Firebase Auth session, clear unless preserved local admin
          if (!localStorage.getItem(LOCAL_ADMIN_KEY)) {
            setRole(null);
            setAssignedClientId(null);
            setLocalAdmin(false);
          }
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

    // 1. Primary: Authenticate via real Firebase Authentication
    if (auth) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        const { role: resolvedRole, assignedClientId: resolvedTenant } = await resolveUserRoleAndTenant(userCred.user);

        setUser(userCred.user);
        setLocalAdmin(true);
        setRole(resolvedRole);
        setAssignedClientId(resolvedTenant);

        try {
          localStorage.setItem(LOCAL_ADMIN_KEY, 'true');
          if (resolvedRole) localStorage.setItem(LOCAL_ROLE_KEY, resolvedRole);
          if (resolvedTenant) {
            localStorage.setItem(LOCAL_CLIENT_ID_KEY, resolvedTenant);
          } else {
            localStorage.removeItem(LOCAL_CLIENT_ID_KEY);
          }
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

    if (!auth) {
      return { success: false, error: 'Firebase Auth is not initialized.' };
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
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
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn('SignOut notice', e);
      }
    }
    setUser(null);
    setLocalAdmin(false);
    setRole(null);
    setAssignedClientId(null);
    try {
      localStorage.removeItem(LOCAL_ADMIN_KEY);
      localStorage.removeItem(LOCAL_ROLE_KEY);
      localStorage.removeItem(LOCAL_CLIENT_ID_KEY);
      localStorage.removeItem(LEGACY_ADMIN_KEY);
      localStorage.removeItem(LEGACY_ROLE_KEY);
      localStorage.removeItem(LEGACY_CLIENT_ID_KEY);
    } catch {}
  };

  const isAdmin = Boolean(user || localAdmin);
  const isDeveloper = role === 'developer';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        role,
        isDeveloper,
        assignedClientId,
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
