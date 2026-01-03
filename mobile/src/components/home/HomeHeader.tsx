import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

interface HomeHeaderProps {
  onSettingsPress: () => void;
}

export function HomeHeader({ onSettingsPress }: HomeHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.logoContainer}>
          <Ionicons name="sparkles" size={20} color={AppColors.primary} />
        </View>
        <Text style={styles.headerTitle}>AI App Builder</Text>
      </View>
      <TouchableOpacity onPress={onSettingsPress}>
        <Ionicons name="settings-outline" size={24} color={AppColors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.surface,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : AppSpacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: `${AppColors.primary}1A`,
    padding: 6,
    borderRadius: 8,
    marginRight: AppSpacing.sm,
  },
  headerTitle: {
    ...AppTypography.mono,
  },
});
