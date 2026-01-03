import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppButton, AppTextField } from '../../components/common';
import { useAuth } from '../../providers';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

export function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { sendPasswordReset, isLoading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const validate = (): boolean => {
    setEmailError('');
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setEmailError('Enter a valid email');
      return false;
    }
    return true;
  };

  const handleReset = async () => {
    if (!validate()) return;

    const success = await sendPasswordReset(email.trim());
    if (success) {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="mail-open" size={64} color={AppColors.success} />
          </View>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successSubtitle}>
            We've sent a password reset link to:
          </Text>
          <Text style={styles.emailText}>{email}</Text>
          <View style={{ height: AppSpacing.xl }} />
          <AppButton
            variant="secondary"
            onPress={() => navigation.goBack()}
          >
            Back to Login
          </AppButton>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Reset Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>Forgot your password?</Text>
        <Text style={styles.description}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        <View style={{ height: AppSpacing.xl }} />

        <AppTextField
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={emailError}
        />

        <View style={{ height: AppSpacing.lg }} />

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <AppButton
          onPress={handleReset}
          isLoading={isLoading}
          width="100%"
        >
          Send Reset Link
        </AppButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.surface,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : AppSpacing.md,
  },
  backButton: {
    padding: AppSpacing.xs,
  },
  title: {
    ...AppTypography.mono,
  },
  content: {
    padding: AppSpacing.xl,
  },
  heading: {
    ...AppTypography.h2,
  },
  description: {
    ...AppTypography.bodySmall,
    color: AppColors.textSecondary,
    marginTop: AppSpacing.sm,
  },
  errorContainer: {
    backgroundColor: `${AppColors.error}1A`,
    borderWidth: 1,
    borderColor: `${AppColors.error}4D`,
    borderRadius: AppSpacing.borderRadius,
    padding: AppSpacing.md,
    marginBottom: AppSpacing.md,
  },
  errorText: {
    ...AppTypography.monoSmall,
    color: AppColors.error,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: AppSpacing.xl,
  },
  successIcon: {
    backgroundColor: `${AppColors.success}1A`,
    padding: AppSpacing.lg,
    borderRadius: 50,
    marginBottom: AppSpacing.lg,
  },
  successTitle: {
    ...AppTypography.h2,
    marginBottom: AppSpacing.sm,
  },
  successSubtitle: {
    ...AppTypography.bodySmall,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  emailText: {
    ...AppTypography.mono,
    color: AppColors.primary,
    marginTop: AppSpacing.sm,
  },
});
