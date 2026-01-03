import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

interface AppTextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  error?: string;
  containerStyle?: ViewStyle;
  suffixIcon?: React.ReactNode;
  prefixIcon?: React.ReactNode;
}

export function AppTextField({
  label,
  hint,
  error,
  containerStyle,
  suffixIcon,
  prefixIcon,
  ...props
}: AppTextFieldProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {prefixIcon && <View style={styles.iconContainer}>{prefixIcon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor={AppColors.textSecondary}
          selectionColor={AppColors.primary}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />
        {suffixIcon && <View style={styles.iconContainer}>{suffixIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...AppTypography.monoSmall,
    color: AppColors.primary,
    marginBottom: AppSpacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.inputBorder,
    borderRadius: AppSpacing.borderRadius,
    paddingHorizontal: AppSpacing.md,
  },
  inputError: {
    borderColor: AppColors.error,
  },
  input: {
    flex: 1,
    ...AppTypography.mono,
    color: AppColors.textPrimary,
    paddingVertical: AppSpacing.md,
  },
  iconContainer: {
    marginLeft: AppSpacing.sm,
  },
  errorText: {
    ...AppTypography.monoSmall,
    color: AppColors.error,
    marginTop: AppSpacing.xs,
  },
});
