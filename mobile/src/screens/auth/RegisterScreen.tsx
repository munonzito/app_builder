import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AppButton, AppTextField } from '../../components/common';
import { useAuth } from '../../providers';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

export function RegisterScreen() {
  const navigation = useNavigation();
  const { signUp, isLoading, error } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name) newErrors.name = 'Name is required';
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    const success = await signUp(email.trim(), password, name.trim());
    if (success) {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <AppTextField
          label="Name"
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <View style={{ height: AppSpacing.md }} />

        <AppTextField
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <View style={{ height: AppSpacing.md }} />

        <AppTextField
          label="Password"
          placeholder="At least 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          error={errors.password}
          suffixIcon={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={AppColors.textSecondary}
              />
            </TouchableOpacity>
          }
        />

        <View style={{ height: AppSpacing.md }} />

        <AppTextField
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          error={errors.confirmPassword}
          suffixIcon={
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color={AppColors.textSecondary}
              />
            </TouchableOpacity>
          }
        />

        <View style={{ height: AppSpacing.lg }} />

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <AppButton
          onPress={handleRegister}
          isLoading={isLoading}
          width="100%"
        >
          Create Account
        </AppButton>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: AppSpacing.xl,
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
});
