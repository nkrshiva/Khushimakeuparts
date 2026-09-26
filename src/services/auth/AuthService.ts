import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from '../../firebase';

export type { User, UserCredential };

/**
 * AuthService
 *
 * Thin infrastructure boundary encapsulating Firebase Authentication SDK operations.
 * Implements Google Sign-In via Firebase Auth.
 * Exposes core auth operations without mixing UI, authorization, or tenant logic.
 */
export class AuthService {
  private googleProvider: GoogleAuthProvider;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    // Always prompt account selection so users can switch Google accounts
    this.googleProvider.setCustomParameters({ prompt: 'select_account' });
  }

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
   * Opens Google's OAuth2 popup and authenticates the user via Firebase.
   * Returns the authenticated UserCredential on success.
   */
  async signInWithGoogle(): Promise<UserCredential> {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized.');
    }
    return await signInWithPopup(auth, this.googleProvider);
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
}

export const authService = new AuthService();
