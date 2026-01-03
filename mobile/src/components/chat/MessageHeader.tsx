import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MessageRole } from '../../models';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

interface MessageHeaderProps {
  role: MessageRole;
  showLoadingIndicator?: boolean;
}

function getPrefix(role: MessageRole): string {
  switch (role) {
    case MessageRole.User:
      return '@you:';
    case MessageRole.Assistant:
      return '@ai:';
    default:
      return '@system:';
  }
}

export function MessageHeader({ role, showLoadingIndicator = false }: MessageHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.prefix}>{getPrefix(role)}</Text>
      {showLoadingIndicator && (
        <ActivityIndicator
          size={12}
          color={AppColors.primary}
          style={styles.indicator}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefix: {
    ...AppTypography.terminalPrefix,
  },
  indicator: {
    marginLeft: AppSpacing.sm,
  },
});
