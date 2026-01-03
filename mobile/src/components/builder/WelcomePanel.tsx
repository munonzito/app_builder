import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';
import { BUILDER_SUGGESTIONS } from '../../constants/suggestions';

interface WelcomePanelProps {
  onSuggestionPress: (suggestion: string) => void;
}

export function WelcomePanel({ onSuggestionPress }: WelcomePanelProps) {
  return (
    <View style={styles.welcomeContainer}>
      <View style={styles.welcomeIcon}>
        <Ionicons name="sparkles" size={48} color={AppColors.primary} />
      </View>
      <Text style={styles.welcomeTitle}>Start Building</Text>
      <Text style={styles.welcomeSubtitle}>
        Describe the app you want to create.{'\n'}Be as detailed as possible for best results.
      </Text>
      <View style={styles.suggestionsContainer}>
        {BUILDER_SUGGESTIONS.map((suggestion) => (
          <TouchableOpacity
            key={suggestion}
            style={styles.suggestionChip}
            onPress={() => onSuggestionPress(suggestion)}
          >
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: AppSpacing.xl,
  },
  welcomeIcon: {
    backgroundColor: `${AppColors.primary}1A`,
    padding: AppSpacing.lg,
    borderRadius: 16,
    marginBottom: AppSpacing.lg,
  },
  welcomeTitle: {
    ...AppTypography.h2,
  },
  welcomeSubtitle: {
    ...AppTypography.bodySmall,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginTop: AppSpacing.sm,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: AppSpacing.sm,
    marginTop: AppSpacing.xl,
  },
  suggestionChip: {
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${AppColors.inputBorder}4D`,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.sm,
  },
  suggestionText: {
    ...AppTypography.monoSmall,
    color: AppColors.textSecondary,
  },
});
