import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  AuthError,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, Character, SportCategory } from '../types';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

class AuthService {
  private currentUser: User | null = null;

  // Initialize auth state listener
  public initialize(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const user = await this.getUserData(firebaseUser.uid);
          this.currentUser = user;
          resolve(user);
        } else {
          this.currentUser = null;
          resolve(null);
        }
        unsubscribe();
      });
    });
  }

  // Sign up with email and password
  public async signUp(
    email: string,
    password: string,
    username: string,
    sportCategory: SportCategory
  ): Promise<AuthResult> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: username,
      });

      // Create user document in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        username,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        level: 1,
        totalXP: 0,
        achievements: [],
        settings: {
          notifications: true,
          privacy: 'friends',
          units: 'metric',
        },
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: userData.createdAt.toISOString(),
        lastLoginAt: userData.lastLoginAt.toISOString(),
      });

      // Create character document
      const character: Character = {
        id: `${firebaseUser.uid}_character`,
        userId: firebaseUser.uid,
        name: username,
        level: 1,
        experience: 0,
        sportCategory,
        stats: this.getInitialStats(sportCategory),
        equipment: [],
        cosmetics: [],
        createdAt: new Date(),
        avatarUrl: '',
        rpmUserId: '',
      };

      await setDoc(doc(db, 'characters', character.id), {
        ...character,
        createdAt: character.createdAt.toISOString(),
      });

      this.currentUser = userData;

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error as AuthError),
      };
    }
  }

  // Sign in with email and password
  public async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = await this.getUserData(userCredential.user.uid);

      // Update last login
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLoginAt: new Date().toISOString(),
      });

      this.currentUser = user;

      return {
        success: true,
        user,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error as AuthError),
      };
    }
  }

  // Sign out
  public async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Get current user
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Get user data from Firestore
  private async getUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          createdAt: new Date(data.createdAt),
          lastLoginAt: new Date(data.lastLoginAt),
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  // Get initial stats based on sport category
  private getInitialStats(sportCategory: SportCategory) {
    const baseStats = {
      strength: 10,
      endurance: 10,
      agility: 10,
      speed: 10,
      flexibility: 10,
    };

    switch (sportCategory) {
      case SportCategory.Basketball:
        return { ...baseStats, agility: 15, speed: 12 };
      case SportCategory.Soccer:
        return { ...baseStats, endurance: 15, speed: 12 };
      case SportCategory.Runner:
        return { ...baseStats, endurance: 18, speed: 15 };
      case SportCategory.Cyclist:
        return { ...baseStats, endurance: 16, strength: 12 };
      case SportCategory.Swimmer:
        return { ...baseStats, endurance: 14, flexibility: 14 };
      case SportCategory.Gym:
        return { ...baseStats, strength: 18, endurance: 12 };
      case SportCategory.Tennis:
        return { ...baseStats, agility: 14, speed: 13 };
      case SportCategory.Yoga:
        return { ...baseStats, flexibility: 18, agility: 12 };
      default:
        return baseStats;
    }
  }

  // Convert Firebase Auth errors to user-friendly messages
  private getErrorMessage(error: AuthError): string {
    console.log('Firebase Auth Error:', error.code, error.message);
    
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/api-key-not-valid':
        return 'Firebase configuration error. Please check your API key.';
      case 'auth/invalid-api-key':
        return 'Firebase configuration error. Please check your API key.';
      case 'permission-denied':
        return 'Database permissions error. Please check Firestore rules.';
      default:
        return error.message || 'An error occurred during authentication.';
    }
  }
}

export default new AuthService();