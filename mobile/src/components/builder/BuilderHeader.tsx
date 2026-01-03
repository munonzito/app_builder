import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

interface BuilderHeaderProps {
  title: string;
  hasPreview: boolean;
  showPreview: boolean;
  onBack: () => void;
  onTogglePreview: () => void;
  onRunNative: () => void;
  onMenu?: () => void;
}

export function BuilderHeader({
  title,
  hasPreview,
  showPreview,
  onBack,
  onTogglePreview,
  onRunNative,
  onMenu,
}: BuilderHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={AppColors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <TouchableOpacity
        style={styles.previewButton}
        onPress={onTogglePreview}
        disabled={!hasPreview}
      >
        <Ionicons
          name={showPreview ? 'chatbubble' : 'phone-portrait'}
          size={24}
          color={hasPreview ? AppColors.primary : AppColors.textSecondary}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.runNativeButton, !hasPreview && styles.runNativeButtonDisabled]}
        onPress={onRunNative}
        disabled={!hasPreview}
      >
        <Ionicons name="play" size={18} color={hasPreview ? '#000' : AppColors.textSecondary} />
        <Text style={[styles.runNativeText, !hasPreview && styles.runNativeTextDisabled]}>
          Run
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={onMenu}>
        <Ionicons name="ellipsis-vertical" size={24} color={AppColors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : AppSpacing.md,
  },
  backButton: {
    padding: AppSpacing.xs,
    marginRight: AppSpacing.sm,
  },
  headerTitle: {
    ...AppTypography.mono,
    flex: 1,
  },
  previewButton: {
    padding: AppSpacing.xs,
    marginHorizontal: AppSpacing.xs,
  },
  runNativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    paddingHorizontal: AppSpacing.sm,
    paddingVertical: AppSpacing.xs,
    borderRadius: 6,
    marginHorizontal: AppSpacing.xs,
    gap: 4,
  },
  runNativeButtonDisabled: {
    backgroundColor: AppColors.surface,
  },
  runNativeText: {
    ...AppTypography.monoSmall,
    color: '#000',
    fontWeight: '600',
  },
  runNativeTextDisabled: {
    color: AppColors.textSecondary,
  },
  menuButton: {
    padding: AppSpacing.xs,
  },
});
