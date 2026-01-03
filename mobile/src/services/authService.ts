import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  get currentUser(): User | null {
    return auth.currentUser;
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  async getIdToken(): Promise<string | null> {
    return auth.currentUser?.getIdToken() || null;
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  async signUpWithEmail(email: string, password: string): Promise<User> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  async updateDisplayName(displayName: string): Promise<void> {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });
    }
  }
}

export const authService = AuthService.getInstance();
