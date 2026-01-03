import { StyleSheet, TextStyle } from 'react-native';

export const AppColors = {
  primary: '#D97757',
  accent: '#D97757',
  background: '#1A1A1A',
  surface: '#242424',
  textPrimary: '#FAF9F5',
  textSecondary: '#5E5D59',
  link: '#D97757',
  inputBorder: '#CCCCCC',
  buttonPrimaryBg: '#141413',
  buttonPrimaryText: '#FAF9F5',
  buttonSecondaryBg: '#FAF9F5',
  buttonSecondaryText: '#5E5D59',
  userMessage: '#FAF9F5',
  systemMessage: '#D97757',
  success: '#4CAF50',
  error: '#E57373',
};

export const AppSpacing = {
  baseUnit: 4,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  borderRadius: 4,
  buttonPrimaryRadius: 8.5,
  buttonSecondaryRadius: 7.5,
};

export const AppTypography: Record<string, TextStyle> = {
  h1: {
    fontFamily: 'Inter_700Bold',
    fontSize: 72,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
  },
  h2: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  h3: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    fontWeight: 'normal',
    color: AppColors.textPrimary,
  },
  bodySmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: 'normal',
    color: AppColors.textPrimary,
  },
  mono: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 16,
    fontWeight: 'normal',
    color: AppColors.textPrimary,
  },
  monoSmall: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14,
    fontWeight: 'normal',
    color: AppColors.textPrimary,
  },
  terminalUser: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14,
    fontWeight: 'normal',
    color: AppColors.userMessage,
  },
  terminalSystem: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14,
    fontWeight: 'normal',
    color: AppColors.systemMessage,
  },
  terminalPrefix: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 14,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  surfaceContainer: {
    backgroundColor: AppColors.surface,
    borderRadius: AppSpacing.borderRadius,
    padding: AppSpacing.md,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
