import React from 'react';
import * as ReactNavigationNative from '@react-navigation/native';
import * as AssetRegistry from '../NativeModules/AssetRegistry';

// Wrapper that wraps in NavigationIndependentTree to avoid nested container errors
function RuntimeNavigationContainer(props: React.ComponentProps<typeof ReactNavigationNative.NavigationContainer>) {
  return (
    <ReactNavigationNative.NavigationIndependentTree>
      <ReactNavigationNative.NavigationContainer {...props} />
    </ReactNavigationNative.NavigationIndependentTree>
  );
}

const aliases: { [key: string]: any } = {
  expo: require('expo'),
  react: require('react'),
  'react/jsx-runtime': require('react/jsx-runtime'),

  // Needed for loading assets from packages bundled by snackager
  AssetRegistry,
  '@react-native/assets-registry/registry': AssetRegistry,

  // Packages that require special initialisation (see Modules.tsx)
  'expo-asset': require('expo-asset'),
  'expo-font': require('expo-font'),
  'react-native-gesture-handler': require('react-native-gesture-handler'),
  'react-native-safe-area-context': require('react-native-safe-area-context'),
  'react-native-vector-icons': require('@expo/vector-icons'),
  '@expo/vector-icons': require('@expo/vector-icons'),

  // Packages that are used internally by the runtime
  'expo-constants': require('expo-constants'),
  '@react-native-async-storage/async-storage': require('@react-native-async-storage/async-storage'),

  // Snackager can't bundle expo-modules-core, so we vendor it instead
  'expo-modules-core': require('expo-modules-core'),

  // Renamed `@react-native-community` packages
  '@react-native-community/async-storage': require('@react-native-async-storage/async-storage'),

  // Common packages that are included for easy of use
  'prop-types': require('prop-types'),

  // Aliases for the image examples in react native docs
  '@expo/snack-static/react-native-logo.png': require('../react-native-logo.png'),

  // Use the fixed react native reanimated shipped in the snack runtime
  'react-native-reanimated': require('react-native-reanimated'),
  'react-native-worklets': require('react-native-worklets'),

  // Only works when vendored into the runtime
  'expo-router': require('expo-router'),
  'expo-router/stack': require('expo-router/stack'),
  'expo-router/tabs': require('expo-router/tabs'),
  'expo-router/head': require('expo-router/head'),
  'expo-router/entry': () => {}, // noop
  
  // Additional common packages
  'expo-linking': require('expo-linking'),
  'expo-splash-screen': require('expo-splash-screen'),
  'expo-status-bar': require('expo-status-bar'),

  // Media
  'expo-av': require('expo-av'),

  // Navigation - use wrapper to inject independent={true}
  '@react-navigation/native': {
    ...ReactNavigationNative,
    NavigationContainer: RuntimeNavigationContainer,
  },
  '@react-navigation/native-stack': require('@react-navigation/native-stack'),
};

export default aliases;
