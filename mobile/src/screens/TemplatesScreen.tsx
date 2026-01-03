import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { templates, AppTemplate } from '../models/template';
import { useProjects } from '../providers';
import { AppColors, AppSpacing, AppTypography } from '../utils/styles';

type RootStackParamList = {
  Templates: undefined;
  Builder: { projectId: string; initialPrompt?: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  'check-circle': 'checkmark-circle-outline',
  note: 'document-text-outline',
  cloud: 'cloud-outline',
  'attach-money': 'cash-outline',
  timer: 'timer-outline',
  'trending-up': 'trending-up-outline',
};

export function TemplatesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { createProject } = useProjects();

  const handleSelectTemplate = async (template: AppTemplate) => {
    const project = await createProject(template.name);
    if (project) {
      navigation.replace('Builder', {
        projectId: project.id,
        initialPrompt: template.prompt,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Templates</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Start with a template</Text>
        <Text style={styles.subtitle}>
          Choose a template to get started quickly, or start from scratch.
        </Text>

        {templates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={styles.templateCard}
            onPress={() => handleSelectTemplate(template)}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={iconMap[template.icon] || 'apps-outline'}
                size={28}
                color={AppColors.primary}
              />
            </View>
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateDescription}>{template.description}</Text>
              <View style={styles.tagsContainer}>
                {template.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={AppColors.textSecondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.surface,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : AppSpacing.md,
  },
  backButton: {
    padding: AppSpacing.xs,
  },
  headerTitle: {
    ...AppTypography.mono,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: AppSpacing.md,
  },
  title: {
    ...AppTypography.h3,
  },
  subtitle: {
    ...AppTypography.bodySmall,
    color: AppColors.textSecondary,
    marginTop: AppSpacing.sm,
    marginBottom: AppSpacing.lg,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    borderRadius: AppSpacing.borderRadius,
    borderWidth: 1,
    borderColor: `${AppColors.inputBorder}4D`,
    padding: AppSpacing.md,
    marginBottom: AppSpacing.md,
  },
  iconContainer: {
    backgroundColor: `${AppColors.primary}1A`,
    padding: AppSpacing.md,
    borderRadius: 12,
    marginRight: AppSpacing.md,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    ...AppTypography.mono,
  },
  templateDescription: {
    ...AppTypography.monoSmall,
    color: AppColors.textSecondary,
    fontSize: 12,
    marginTop: AppSpacing.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing.xs,
    marginTop: AppSpacing.sm,
  },
  tag: {
    backgroundColor: AppColors.background,
    borderRadius: 4,
    paddingHorizontal: AppSpacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    ...AppTypography.monoSmall,
    fontSize: 10,
    color: AppColors.textSecondary,
  },
});
