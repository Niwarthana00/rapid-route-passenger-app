import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string | null;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string, phone: string) => Promise<void>;
  loginWithGoogleCredential: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: true,
  loginWithEmail: async () => {},
  signUpWithEmail: async () => {},
  loginWithGoogleCredential: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync user profile from Firestore or Auth
  const fetchUserProfile = async (currentUser: User) => {
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile({
          uid: currentUser.uid,
          name: data.name || currentUser.displayName || 'Passenger',
          email: currentUser.email || '',
          phone: data.phone || '+94 77 123 4567',
          photoURL: currentUser.photoURL || null,
        });
      } else {
        const defaultProfile: UserProfile = {
          uid: currentUser.uid,
          name: currentUser.displayName || 'Passenger',
          email: currentUser.email || '',
          phone: '+94 77 123 4567',
          photoURL: currentUser.photoURL || null,
        };
        setUserProfile(defaultProfile);
        await setDoc(userDocRef, defaultProfile, { merge: true });
      }
    } catch (e) {
      setUserProfile({
        uid: currentUser.uid,
        name: currentUser.displayName || 'Passenger',
        email: currentUser.email || '',
        phone: '+94 77 123 4567',
        photoURL: currentUser.photoURL || null,
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email / Password Login
  const loginWithEmail = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    await fetchUserProfile(userCredential.user);
  };

  // Email / Password Sign Up
  const signUpWithEmail = async (name: string, email: string, pass: string, phone: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const currentUser = userCredential.user;

    // Update display name in Firebase Auth
    if (name) {
      await updateProfile(currentUser, { displayName: name.trim() });
    }

    // Save profile to Firestore
    const newProfile: UserProfile = {
      uid: currentUser.uid,
      name: name.trim() || 'Passenger',
      email: email.trim(),
      phone: phone.trim() || '+94 77 123 4567',
      photoURL: null,
    };

    try {
      await setDoc(doc(db, 'users', currentUser.uid), newProfile);
    } catch (e) {
      console.log('Firestore write skipped or failed:', e);
    }

    setUserProfile(newProfile);
  };

  // Google Sign-In with ID Token
  const loginWithGoogleCredential = async (idToken: string) => {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    await fetchUserProfile(userCredential.user);
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isLoading,
        loginWithEmail,
        signUpWithEmail,
        loginWithGoogleCredential,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
