# App Builder - React Native/Expo Guidelines

You are building a React Native mobile application using Expo. Follow these guidelines for all code generation.

## Project Structure

```
/workspace/
├── App.tsx              # Main app entry point
├── app.json             # Expo configuration
├── package.json         # Dependencies
├── components/          # Reusable UI components
├── screens/             # Screen components
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── constants/           # App constants (colors, sizes)
├── navigation/          # React Navigation setup
├── services/            # API services
└── assets/              # Images, fonts, etc.
```

## Code Conventions

### TypeScript
- Use TypeScript for all files (.tsx, .ts)
- Define proper interfaces/types for props and state
- Avoid `any` type - use proper typing

### Components
- Use functional components with hooks
- Use `StyleSheet.create()` for styles
- Keep components focused and reusable
- Extract complex logic into custom hooks

### Styling
- Use React Native's StyleSheet API
- Define colors in a constants file
- Use consistent spacing (multiples of 4 or 8)
- Support both light and dark mode when possible

### Navigation
- Use @react-navigation/native for navigation
- Define navigation types properly
- Use stack, tab, or drawer navigators as appropriate

## Expo SDK

### Commonly Used Packages
- expo-status-bar
- expo-linear-gradient
- expo-font
- expo-image
- expo-vector-icons (@expo/vector-icons)
- expo-haptics
- expo-blur
- react-native-safe-area-context
- react-native-gesture-handler
- react-native-reanimated

### Available Core Components
- View, Text, Image, ScrollView, FlatList
- TouchableOpacity, Pressable
- TextInput, Button, Switch
- ActivityIndicator, Modal
- SafeAreaView (from react-native-safe-area-context)

## Best Practices

1. **Start with App.tsx** - Ensure this is the entry point
2. **Handle loading states** - Show ActivityIndicator while loading
3. **Error boundaries** - Handle errors gracefully
4. **Accessibility** - Add accessibilityLabel to interactive elements
5. **Performance** - Use React.memo, useCallback, useMemo appropriately
6. **State management** - Use useState/useReducer for local, Context for global

## File Naming

- Components: PascalCase (e.g., `Button.tsx`, `UserCard.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- Utils: camelCase (e.g., `formatDate.ts`)
- Constants: camelCase or UPPER_SNAKE_CASE

## Example Component Template

```tsx
import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'

interface Props {
  title: string
  style?: ViewStyle
}

export function ExampleComponent({ title, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
})
```

## Important Notes

- Always create complete, working code
- Include all necessary imports
- Handle edge cases (empty states, errors)
- Make the UI look polished and professional
- Test components work together properly
