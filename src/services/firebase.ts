import { initializeApp, getApps, getApp } from 'firebase/app';
import * as authLib from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAEvRNWJUgth0DuJprFC-JUtL9XxVRbSyc",
  authDomain: "rapid-route-passenger.firebaseapp.com",
  projectId: "rapid-route-passenger",
  storageBucket: "rapid-route-passenger.firebasestorage.app",
  messagingSenderId: "206964995281",
  appId: "1:206964995281:web:cda19516d297a8053a41f0"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage Persistence
let auth: authLib.Auth;
try {
  const getPersistence = (authLib as any).getReactNativePersistence;
  if (typeof getPersistence === 'function') {
    auth = authLib.initializeAuth(app, {
      persistence: getPersistence(AsyncStorage),
    });
  } else {
    auth = authLib.getAuth(app);
  }
} catch (error) {
  auth = authLib.getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
