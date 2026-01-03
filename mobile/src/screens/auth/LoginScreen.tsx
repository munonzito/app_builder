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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton, AppTextField } from '../../components/common';
import { useAuth } from '../../providers';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { signIn, isLoading, error } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validate = (): boolean => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email is required');
      valid = false;
    } else if (!email.includes('@')) {
      setEmailError('Enter a valid email');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    const success = await signIn(email.trim(), password);
    if (success) {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="sparkles" size={32} color={AppColors.primary} />
          </View>
          <Text style={styles.title}>AI App Builder</Text>
          <Text style={styles.subtitle}>Build mobile apps with AI</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <AppTextField
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
          />
          
          <View style={{ height: AppSpacing.md }} />
          
          <AppTextField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            error={passwordError}
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

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <AppButton
            onPress={handleLogin}
            isLoading={isLoading}
            width="100%"
          >
            Sign In
          </AppButton>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: AppSpacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: AppSpacing.xl * 2,
  },
  iconContainer: {
    backgroundColor: `${AppColors.primary}1A`,
    padding: AppSpacing.md,
    borderRadius: 12,
    marginBottom: AppSpacing.md,
  },
  title: {
    ...AppTypography.h2,
  },
  subtitle: {
    ...AppTypography.bodySmall,
    color: AppColors.textSecondary,
    marginTop: AppSpacing.sm,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginVertical: AppSpacing.sm,
  },
  forgotPasswordText: {
    ...AppTypography.monoSmall,
    color: AppColors.primary,
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: AppSpacing.lg,
  },
  registerText: {
    ...AppTypography.bodySmall,
    color: AppColors.textSecondary,
  },
  registerLink: {
    ...AppTypography.mono,
    color: AppColors.primary,
  },
});
