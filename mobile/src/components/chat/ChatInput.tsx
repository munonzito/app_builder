import React from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  enabled?: boolean;
  isGenerating?: boolean;
  onCancel?: () => void;
}

export function ChatInput({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Describe your app...',
  enabled = true,
  isGenerating = false,
  onCancel,
}: ChatInputProps) {
  const hasText = value.trim().length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.prefix}>{'> '}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={isGenerating ? 'Generating...' : placeholder}
        placeholderTextColor={AppColors.textSecondary}
        editable={enabled && !isGenerating}
        autoCapitalize="sentences"
        autoCorrect={false}
        multiline
        onSubmitEditing={onSubmit}
        blurOnSubmit={false}
        selectionColor={AppColors.primary}
      />
      {isGenerating ? (
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Ionicons name="stop" size={16} color="#EF5350" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.sendButton}
          onPress={onSubmit}
          disabled={!enabled || !hasText}
        >
          <Ionicons
            name="send"
            size={20}
            color={enabled && hasText ? AppColors.primary : AppColors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.inputBorder,
    borderRadius: AppSpacing.borderRadius,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.sm,
  },
  prefix: {
    ...AppTypography.terminalPrefix,
    marginRight: 4,
  },
  input: {
    flex: 1,
    ...AppTypography.mono,
    color: AppColors.textPrimary,
    maxHeight: 100,
    paddingVertical: 0,
  },
  sendButton: {
    padding: 4,
  },
  cancelButton: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(239, 83, 80, 0.1)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
