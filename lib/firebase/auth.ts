import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  User,
  AuthError,
  signInWithPopup,
  GoogleAuthProvider,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth';
import { getAuthService, getFirestoreService } from './config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
}

export interface AuthResponse {
  user?: AuthUser;
  error?: string;
  success: boolean;
}

/**
 * Sign up a new user with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<AuthResponse> => {
  try {
    const auth = getAuthService();
    if (!auth) throw new Error('Firebase not initialized');

    // Set persistence
    await setPersistence(auth, browserLocalPersistence);

    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    const db = getFirestoreService();
    if (db) {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
        role: 'user',
        phone: null,
      });
    }

    return {
      user: mapAuthUser(user),
      success: true,
    };
  } catch (error) {
    return {
      error: getErrorMessage(error as AuthError),
      success: false,
    };
  }
};

/**
 * Sign in user with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const auth = getAuthService();
    if (!auth) throw new Error('Firebase not initialized');

    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    return {
      user: mapAuthUser(userCredential.user),
      success: true,
    };
  } catch (error) {
    return {
      error: getErrorMessage(error as AuthError),
      success: false,
    };
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    const auth = getAuthService();
    if (!auth) throw new Error('Firebase not initialized');

    const provider = new GoogleAuthProvider();
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Create user document if first time
    const db = getFirestoreService();
    if (db) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          role: 'user',
          phone: null,
        });
      }
    }

    return {
      user: mapAuthUser(user),
      success: true,
    };
  } catch (error) {
    return {
      error: getErrorMessage(error as AuthError),
      success: false,
    };
  }
};

/**
 * Sign in with phone number
 */
export const signInWithPhone = async (
  phoneNumber: string,
  recaptchaContainerId: string
): Promise<{ confirmationResult: any; success: boolean; error?: string }> => {
  try {
    const auth = getAuthService();
    if (!auth) throw new Error('Firebase not initialized');

    const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: 'invisible',
    });

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier
    );

    return {
      confirmationResult,
      success: true,
    };
  } catch (error) {
    return {
      confirmationResult: null,
      success: false,
      error: getErrorMessage(error as AuthError),
    };
  }
};

/**
 * Confirm phone number with OTP
 */
export const confirmPhoneOtp = async (
  confirmationResult: any,
  otp: string
): Promise<AuthResponse> => {
  try {
    const userCredential = await confirmationResult.confirm(otp);
    const user = userCredential.user;

    // Create user document if first time
    const db = getFirestoreService();
    if (db) {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          phone: user.phoneNumber,
          createdAt: new Date(),
          role: 'user',
        });
      }
    }

    return {
      user: mapAuthUser(user),
      success: true,
    };
  } catch (error) {
    return {
      error: getErrorMessage(error as AuthError),
      success: false,
    };
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<AuthResponse> => {
  try {
    const auth = getAuthService();
    if (!auth) throw new Error('Firebase not initialized');

    await sendPasswordResetEmail(auth, email);

    return {
      success: true,
    };
  } catch (error) {
    return {
      error: getErrorMessage(error as AuthError),
      success: false,
    };
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<AuthResponse> => {
  try {
    const auth = getAuthService();
    if (!auth) throw new Error('Firebase not initialized');

    await signOut(auth);

    return {
      success: true,
    };
  } catch (error) {
    return {
      error: getErrorMessage(error as AuthError),
      success: false,
    };
  }
};

/**
 * Get current user
 */
export const getCurrentAuthUser = (): AuthUser | null => {
  const auth = getAuthService();
  if (!auth || !auth.currentUser) return null;
  return mapAuthUser(auth.currentUser);
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChanged = (callback: (user: AuthUser | null) => void) => {
  const auth = getAuthService();
  if (!auth) return () => {};

  return auth.onAuthStateChanged((firebaseUser: User | null) => {
    callback(firebaseUser ? mapAuthUser(firebaseUser) : null);
  });
};

/**
 * Helper: Map Firebase user to AuthUser
 */
const mapAuthUser = (firebaseUser: User): AuthUser => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
  phoneNumber: firebaseUser.phoneNumber,
});

/**
 * Helper: Get user-friendly error messages
 */
const getErrorMessage = (error: AuthError): string => {
  const errorMap: Record<string, string> = {
    'auth/weak-password': 'كلمة المرور ضعيفة جداً',
    'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
    'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
    'auth/user-not-found': 'المستخدم غير موجود',
    'auth/wrong-password': 'كلمة المرور غير صحيحة',
    'auth/too-many-requests': 'حاولت عدة مرات. حاول لاحقاً',
    'auth/account-exists-with-different-credential':
      'حساب موجود برسالة بريد مختلفة',
    'auth/invalid-phone-number': 'رقم الهاتف غير صحيح',
  };

  return errorMap[error.code] || error.message || 'حدث خطأ أثناء المصادقة';
};
