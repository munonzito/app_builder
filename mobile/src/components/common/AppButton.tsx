import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

type AppButtonVariant = 'primary' | 'secondary' | 'text';

interface AppButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: AppButtonVariant;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}

export function AppButton({
  onPress,
  children,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  icon,
  width,
  height = 48,
  style,
}: AppButtonProps) {
  const isDisabled = disabled || isLoading;

  const buttonContent = isLoading ? (
    <ActivityIndicator size="small" color={AppColors.textPrimary} />
  ) : icon ? (
    <View style={styles.iconContainer}>
      {icon}
      <View style={{ width: AppSpacing.sm }} />
      {children}
    </View>
  ) : (
    children
  );

  const buttonStyle: ViewStyle = {
    width: width as any,
    height,
    ...styles.base,
    ...(variant === 'primary' && styles.primary),
    ...(variant === 'secondary' && styles.secondary),
    ...(variant === 'text' && styles.text),
    ...(isDisabled && styles.disabled),
    ...style,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={buttonStyle}
      activeOpacity={0.7}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.buttonText,
            variant === 'secondary' && styles.secondaryText,
          ]}
        >
          {children}
        </Text>
      ) : (
        buttonContent
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: AppSpacing.borderRadius,
    paddingHorizontal: AppSpacing.md,
  },
  primary: {
    backgroundColor: AppColors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  text: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...AppTypography.mono,
    color: AppColors.textPrimary,
  } as TextStyle,
  secondaryText: {
    color: AppColors.primary,
  },
});
