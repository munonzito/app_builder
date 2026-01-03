import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/common';
import { useAuth } from '../providers';
import { AppColors, AppSpacing, AppTypography } from '../utils/styles';

type RootStackParamList = {
  Settings: undefined;
  Auth: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out?',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
          },
        },
      ]
    );
  };

  const SettingsItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <Ionicons name={icon} size={20} color={AppColors.textSecondary} />
      <View style={styles.settingsItemContent}>
        <Text style={styles.settingsItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && onPress && (
        <Ionicons name="chevron-forward" size={20} color={AppColors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.accountCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{user?.displayName || 'User'}</Text>
              <Text style={styles.accountEmail}>{user?.email}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={18} color={AppColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingsCard}>
            <SettingsItem icon="color-palette-outline" title="Theme" subtitle="Dark" />
            <View style={styles.divider} />
            <SettingsItem icon="language-outline" title="Language" subtitle="English" />
            <View style={styles.divider} />
            <SettingsItem icon="notifications-outline" title="Notifications" subtitle="Enabled" />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingsCard}>
            <SettingsItem icon="information-circle-outline" title="Version" subtitle="1.0.0" showArrow={false} />
            <View style={styles.divider} />
            <SettingsItem icon="document-text-outline" title="Terms of Service" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingsItem icon="shield-checkmark-outline" title="Privacy Policy" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingsItem icon="help-circle-outline" title="Help & Support" onPress={() => {}} />
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <AppButton
            variant="secondary"
            onPress={handleSignOut}
            width="100%"
            icon={<Ionicons name="log-out-outline" size={18} color={AppColors.error} />}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </AppButton>
        </View>
      </ScrollView>
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
  headerTitle: {
    ...AppTypography.mono,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: AppSpacing.md,
  },
  section: {
    marginBottom: AppSpacing.lg,
  },
  sectionTitle: {
    ...AppTypography.monoSmall,
    color: AppColors.primary,
    marginBottom: AppSpacing.md,
  },
  settingsCard: {
    backgroundColor: AppColors.surface,
    borderRadius: AppSpacing.borderRadius,
    padding: AppSpacing.md,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: AppSpacing.md,
  },
  settingsItemContent: {
    flex: 1,
    marginLeft: AppSpacing.md,
  },
  settingsItemTitle: {
    ...AppTypography.mono,
  },
  settingsItemSubtitle: {
    ...AppTypography.monoSmall,
    color: AppColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.background,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: AppSpacing.borderRadius,
    padding: AppSpacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${AppColors.primary}1A`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...AppTypography.h2,
    color: AppColors.primary,
  },
  accountInfo: {
    flex: 1,
    marginLeft: AppSpacing.md,
  },
  accountName: {
    ...AppTypography.mono,
  },
  accountEmail: {
    ...AppTypography.monoSmall,
    color: AppColors.textSecondary,
    marginTop: AppSpacing.xs,
  },
  signOutSection: {
    marginTop: AppSpacing.xl,
  },
  signOutText: {
    ...AppTypography.mono,
    color: AppColors.error,
  },
});
