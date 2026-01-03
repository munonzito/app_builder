import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlanTask, PlanTaskStatus } from '../../models/agentEvent';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

interface PlanChecklistProps {
  tasks: PlanTask[];
}

export function PlanChecklist({ tasks }: PlanChecklistProps) {
  if (tasks.length === 0) return null;

  const completedCount = tasks.filter((t) => t.status === PlanTaskStatus.Completed).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="list" size={14} color={AppColors.primary} />
        <View style={{ width: AppSpacing.xs }} />
        <Text style={styles.title}>Plan</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.count}>
          {completedCount}/{tasks.length}
        </Text>
      </View>
      {tasks.map((task) => (
        <View key={task.id} style={styles.taskRow}>
          <View style={styles.statusIcon}>{renderStatusIcon(task.status)}</View>
          <Text
            style={[
              styles.taskText,
              task.status === PlanTaskStatus.Completed && styles.completedText,
            ]}
            numberOfLines={2}
          >
            {task.description}
          </Text>
        </View>
      ))}
    </View>
  );
}

function renderStatusIcon(status: PlanTaskStatus) {
  switch (status) {
    case PlanTaskStatus.Pending:
      return (
        <Ionicons
          name="radio-button-off"
          size={14}
          color={AppColors.textSecondary}
        />
      );
    case PlanTaskStatus.InProgress:
      return <ActivityIndicator size={14} color={AppColors.primary} />;
    case PlanTaskStatus.Completed:
      return (
        <Ionicons name="checkmark-circle" size={14} color={AppColors.success} />
      );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.surface,
    borderRadius: AppSpacing.borderRadius,
    borderWidth: 1,
    borderColor: `${AppColors.primary}4D`,
    padding: AppSpacing.sm,
    marginBottom: AppSpacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppSpacing.xs,
  },
  title: {
    ...AppTypography.monoSmall,
    color: AppColors.primary,
    fontWeight: '600',
    fontSize: 11,
  },
  count: {
    ...AppTypography.monoSmall,
    color: AppColors.textSecondary,
    fontSize: 10,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  statusIcon: {
    width: 16,
    height: 16,
    marginRight: AppSpacing.xs,
  },
  taskText: {
    ...AppTypography.monoSmall,
    color: AppColors.textPrimary,
    fontSize: 11,
    flex: 1,
  },
  completedText: {
    color: AppColors.textSecondary,
    textDecorationLine: 'line-through',
  },
});
