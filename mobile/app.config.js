import 'dotenv/config';

export default {
  expo: {
    name: 'AI App Builder',
    slug: 'app-builder-rn',
    version: '1.0.0',
    orientation: 'default',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#1A1A1A',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.munoncode.appbuilder',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#1A1A1A',
      },
      package: 'com.appbuilder.rn',
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-font'],
    extra: {
      firebaseIosApiKey: process.env.FIREBASE_IOS_API_KEY,
      firebaseAndroidApiKey: process.env.FIREBASE_ANDROID_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseIosAppId: process.env.FIREBASE_IOS_APP_ID,
      firebaseAndroidAppId: process.env.FIREBASE_ANDROID_APP_ID,
    },
  },
};
