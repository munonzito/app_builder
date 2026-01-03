import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TypewriterText } from '../common';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

interface QuickActionsProps {
  hasAnimated: boolean;
  onAnimationComplete: () => void;
  onNewApp: () => void;
  onTemplates: () => void;
  onMyApps: () => void;
}

export function QuickActions({
  hasAnimated,
  onAnimationComplete,
  onNewApp,
  onTemplates,
  onMyApps,
}: QuickActionsProps) {
  return (
    <View style={styles.section}>
      {!hasAnimated ? (
        <TypewriterText
          text="Quick Actions"
          style={styles.sectionTitle}
          typingSpeed={80}
          onComplete={onAnimationComplete}
        />
      ) : (
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      )}
      {hasAnimated && (
        <>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionCard} onPress={onNewApp}>
              <Ionicons name="add-circle-outline" size={28} color={AppColors.primary} />
              <Text style={styles.actionTitle}>New App</Text>
              <Text style={styles.actionSubtitle}>Start from scratch</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={onTemplates}>
              <Ionicons name="grid-outline" size={28} color={AppColors.primary} />
              <Text style={styles.actionTitle}>Templates</Text>
              <Text style={styles.actionSubtitle}>Start with a template</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.actionCardFull} onPress={onMyApps}>
            <Ionicons name="folder-outline" size={28} color={AppColors.primary} />
            <View style={{ width: AppSpacing.md }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>My Apps</Text>
              <Text style={styles.actionSubtitle}>View all your projects</Text>
            </View>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: AppSpacing.xl,
  },
  sectionTitle: {
    ...AppTypography.h3,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: AppSpacing.md,
    marginTop: AppSpacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: AppColors.surface,
    borderRadius: AppSpacing.borderRadius,
    borderWidth: 1,
    borderColor: `${AppColors.inputBorder}4D`,
    padding: AppSpacing.md,
  },
  actionCardFull: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: AppSpacing.borderRadius,
    borderWidth: 1,
    borderColor: `${AppColors.inputBorder}4D`,
    padding: AppSpacing.md,
    marginTop: AppSpacing.md,
  },
  actionTitle: {
    ...AppTypography.mono,
    marginTop: AppSpacing.md,
  },
  actionSubtitle: {
    ...AppTypography.monoSmall,
    color: AppColors.textSecondary,
    fontSize: 12,
    marginTop: AppSpacing.xs,
  },
});
