import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from '../../firebase';

export type { User, UserCredential };

/**
 * AuthService
 * 
 * Thin infrastructure boundary encapsulating Firebase Authentication SDK operations.
 * Exposes core auth operations without mixing UI, authorization, or tenant logic.
 */
export class AuthService {
  /**
   * Checks whether the Firebase Auth instance is initialized.
   */
  isAvailable(): boolean {
    return Boolean(auth);
  }

  /**
   * Retrieves the current user directly from the Firebase Auth instance.
   */
  getCurrentUser(): User | null {
    return auth?.currentUser ?? null;
  }

  /**
   * Subscribes to Firebase Authentication state changes.
   * Returns an unsubscribe function.
   */
  onAuthStateChanged(callback: (user: User | null) => void | Promise<void>): () => void {
    if (!auth) {
      return () => {};
    }
    return firebaseOnAuthStateChanged(auth, callback);
  }

  /**
   * Authenticates a user with email and password via Firebase Auth SDK.
   */
  async signIn(email: string, pass: string): Promise<UserCredential> {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized.');
    }
    return await signInWithEmailAndPassword(auth, email, pass);
  }

  /**
   * Signs out the current user via Firebase Auth SDK.
   */
  async signOut(): Promise<void> {
    if (!auth) {
      return;
    }
    await firebaseSignOut(auth);
  }

  /**
   * Triggers a password reset email via Firebase Auth SDK.
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized.');
    }
    await firebaseSendPasswordResetEmail(auth, email);
  }
}

export const authService = new AuthService();
