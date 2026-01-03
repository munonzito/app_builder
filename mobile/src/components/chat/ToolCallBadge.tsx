import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ToolCall, getToolLabel, getToolContextText } from '../../models/agentEvent';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

interface ToolCallBadgeProps {
  toolCall: ToolCall;
}

export function ToolCallBadge({ toolCall }: ToolCallBadgeProps) {
  const label = getToolLabel(toolCall.toolName);
  const contextText = getToolContextText(toolCall.toolName, toolCall.args);

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.label}>{label}</Text>
        {contextText && (
          <>
            <View style={{ width: AppSpacing.xs }} />
            <Text style={styles.context} numberOfLines={1}>
              {contextText}
            </Text>
          </>
        )}
        <View style={{ width: AppSpacing.xs }} />
        {toolCall.isComplete ? (
          <Ionicons name="checkmark" size={12} color={AppColors.success} />
        ) : (
          <ActivityIndicator size={10} color={AppColors.primary} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${AppColors.primary}26`,
    borderWidth: 1,
    borderColor: `${AppColors.primary}4D`,
    borderRadius: 4,
    paddingHorizontal: AppSpacing.sm,
    paddingVertical: AppSpacing.xs,
  },
  label: {
    ...AppTypography.monoSmall,
    color: AppColors.primary,
    fontWeight: '600',
    fontSize: 11,
  },
  context: {
    ...AppTypography.monoSmall,
    color: AppColors.textSecondary,
    fontSize: 11,
    maxWidth: 200,
  },
});
