import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message, MessageRole, StreamItem, PlanTask } from '../../models';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';
import { MessageHeader } from './MessageHeader';
import { AssistantMessageContent } from './AssistantMessageContent';
import { parseStoredStreamItems } from './utils/streamItemUtils';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  streamItems?: StreamItem[];
  planTasks?: PlanTask[];
}

function getBackgroundColor(role: MessageRole): string {
  switch (role) {
    case MessageRole.User:
      return 'transparent';
    case MessageRole.Assistant:
      return AppColors.surface;
    default:
      return AppColors.background;
  }
}

function getMessageStyle(role: MessageRole) {
  switch (role) {
    case MessageRole.User:
      return styles.userMessage;
    case MessageRole.System:
      return styles.systemMessage;
    default:
      return null;
  }
}

export function ChatMessage({
  message,
  isStreaming = false,
  streamItems = [],
  planTasks = [],
}: ChatMessageProps) {
  const storedItems = useMemo(
    () => parseStoredStreamItems(message.metadata?.streamItems as any[]),
    [message.metadata]
  );

  const displayItems = streamItems.length > 0 ? streamItems : storedItems;
  const showHeaderLoading = isStreaming && displayItems.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor(message.role) }]}>
      <MessageHeader role={message.role} showLoadingIndicator={showHeaderLoading} />

      {message.role !== MessageRole.Assistant && message.content && (
        <Text style={getMessageStyle(message.role)} selectable>
          {message.content}
        </Text>
      )}

      {message.role === MessageRole.Assistant && (
        <AssistantMessageContent
          content={message.content}
          isStreaming={isStreaming}
          displayItems={displayItems}
          planTasks={planTasks}
          previewUrl={message.metadata?.previewUrl as string | undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: AppSpacing.sm,
    paddingHorizontal: AppSpacing.md,
  },
  userMessage: {
    ...AppTypography.terminalUser,
    marginTop: AppSpacing.xs,
  },
  systemMessage: {
    ...AppTypography.monoSmall,
    color: AppColors.textSecondary,
    marginTop: AppSpacing.xs,
  },
});
