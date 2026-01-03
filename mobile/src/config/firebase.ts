import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  initializeAuth, 
  getAuth, 
  Auth,
  // @ts-ignore: getReactNativePersistence exists in the RN bundle but is missing from TS definitions
  getReactNativePersistence 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Firebase config from environment variables (set in app.config.js or .env)
const extra = Constants.expoConfig?.extra ?? {};
const firebaseConfig = {
  apiKey: Platform.OS === 'ios' 
    ? extra.firebaseIosApiKey 
    : extra.firebaseAndroidApiKey,
  authDomain: extra.firebaseAuthDomain,
  projectId: extra.firebaseProjectId,
  storageBucket: extra.firebaseStorageBucket,
  messagingSenderId: extra.firebaseMessagingSenderId,
  appId: Platform.OS === 'ios'
    ? extra.firebaseIosAppId
    : extra.firebaseAndroidAppId,
};

// Initialize Firebase only if it hasn't been initialized
let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  // Initialize auth with React Native persistence using AsyncStorage
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} else {
  app = getApps()[0];
  auth = getAuth(app);
}

export { auth };
export const firestore = getFirestore(app);
export default app;
