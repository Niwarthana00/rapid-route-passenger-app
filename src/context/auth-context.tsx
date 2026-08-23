import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string | null;
}

interface AuthContextType {
  user: any | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  setCurrentUserFromStorage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: true,
  loginWithEmail: async () => {},
  signUpWithEmail: async () => {},
  logout: async () => {},
  setCurrentUserFromStorage: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setCurrentUserFromStorage = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      if (token && userDataStr) {
        const userData = JSON.parse(userDataStr);
        const u = userData.user || userData;
        const p = userData.profile || {};
        const profile: UserProfile = {
          uid: u.id || u.uid || '1',
          name: p.full_name || p.fullName || u.fullName || u.name || 'Passenger',
          email: u.email || p.email || '',
          phone: u.phone || p.phone || '',
          photoURL: null,
        };
        setUser(u);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
    } catch (e) {
      console.warn('[AuthContext] Failed to load user from storage:', e);
    }
  };

  useEffect(() => {
    async function loadStoredAuth() {
      setIsLoading(true);
      await setCurrentUserFromStorage();
      setIsLoading(false);
    }
    loadStoredAuth();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    const res = await api.loginUser(email, pass);
    if (res.success && res.data) {
      await AsyncStorage.setItem('userToken', res.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(res.data));
      await setCurrentUserFromStorage();
    } else {
      throw new Error(res.message || 'Invalid credentials');
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string, phone: string) => {
    const regRes = await api.registerPassenger({
      fullName: name,
      phone,
      email,
      password: pass,
    });
    if (regRes.success) {
      await loginWithEmail(email, pass);
    } else {
      throw new Error(regRes.message || 'Registration failed');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
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
        logout,
        setCurrentUserFromStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
