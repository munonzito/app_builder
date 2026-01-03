import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Project } from '../../models';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
  onDelete?: () => void;
  onExport?: () => void;
}

export function ProjectCard({ project, onPress, onDelete, onExport }: ProjectCardProps) {
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days === 0) {
      if (hours === 0) {
        return `${minutes}m ago`;
      }
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* Preview area - takes remaining space */}
      <View style={styles.preview}>
        <Ionicons
          name="phone-portrait-outline"
          size={48}
          color={`${AppColors.primary}80`}
        />
      </View>
      
      {/* Info section - fixed height */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {project.name}
        </Text>
        <Text style={styles.date}>{formatDate(project.updatedAt)}</Text>
      </View>
      
      {/* Actions bar - fixed height */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onExport}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="download-outline" size={18} color={AppColors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={18} color="#EF5350" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.surface,
    borderRadius: AppSpacing.borderRadius,
    borderWidth: 1,
    borderColor: `${AppColors.inputBorder}4D`,
    overflow: 'hidden',
  },
  preview: {
    flex: 1,
    backgroundColor: AppColors.background,
    borderTopLeftRadius: AppSpacing.borderRadius,
    borderTopRightRadius: AppSpacing.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: AppSpacing.md,
    backgroundColor: AppColors.surface,
  },
  name: {
    ...AppTypography.mono,
    color: AppColors.textPrimary,
  },
  date: {
    ...AppTypography.monoSmall,
    color: AppColors.textSecondary,
    fontSize: 11,
    marginTop: AppSpacing.xs,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: `${AppColors.inputBorder}4D`,
    backgroundColor: AppColors.surface,
  },
  actionButton: {
    flex: 1,
    paddingVertical: AppSpacing.sm,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: `${AppColors.inputBorder}4D`,
    alignSelf: 'center',
  },
});
