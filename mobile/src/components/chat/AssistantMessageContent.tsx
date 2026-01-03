import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StreamItem, PlanTask, TextStreamItem, ToolCallStreamItem } from '../../models';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';
import { ToolCallBadge } from './ToolCallBadge';
import { PlanChecklist } from './PlanChecklist';

interface AssistantMessageContentProps {
  content: string;
  isStreaming: boolean;
  displayItems: StreamItem[];
  planTasks: PlanTask[];
  previewUrl?: string;
}

export function AssistantMessageContent({
  content,
  isStreaming,
  displayItems,
  planTasks,
  previewUrl,
}: AssistantMessageContentProps) {
  const showThinking = isStreaming && displayItems.length === 0 && planTasks.length === 0;
  const showFallbackContent = !isStreaming && displayItems.length === 0 && content;

  return (
    <>
      {planTasks.length > 0 && <PlanChecklist tasks={planTasks} />}

      {showThinking && (
        <Text style={[styles.message, styles.thinkingText]}>Thinking...</Text>
      )}

      {displayItems.length > 0 ? (
        displayItems.map((item, index) => (
          <View
            key={item.id + index}
            style={index === displayItems.length - 1 ? undefined : styles.itemSpacing}
          >
            {item.type === 'text' ? (
              <Text style={styles.message} selectable>
                {(item as TextStreamItem).text}
              </Text>
            ) : (
              <ToolCallBadge toolCall={(item as ToolCallStreamItem).toolCall} />
            )}
          </View>
        ))
      ) : (
        showFallbackContent && (
          <Text style={styles.message} selectable>
            {content}
          </Text>
        )
      )}

      {previewUrl && (
        <View style={styles.previewBadge}>
          <Ionicons name="eye" size={14} color={AppColors.primary} />
          <Text style={styles.previewText}>Preview updated</Text>
        </View>
      )}

      {isStreaming && (
        <View style={styles.streamingIndicator}>
          <ActivityIndicator size={14} color={AppColors.primary} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  message: {
    ...AppTypography.terminalSystem,
    marginTop: AppSpacing.xs,
  },
  thinkingText: {
    color: AppColors.textSecondary,
    fontStyle: 'italic',
  },
  itemSpacing: {
    marginBottom: AppSpacing.xs,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${AppColors.primary}1A`,
    borderRadius: AppSpacing.borderRadius,
    paddingHorizontal: AppSpacing.sm,
    paddingVertical: AppSpacing.xs,
    alignSelf: 'flex-start',
    marginTop: AppSpacing.sm,
  },
  previewText: {
    ...AppTypography.monoSmall,
    color: AppColors.primary,
    fontSize: 12,
    marginLeft: AppSpacing.xs,
  },
  streamingIndicator: {
    position: 'absolute',
    right: AppSpacing.md,
    bottom: AppSpacing.sm,
  },
});
