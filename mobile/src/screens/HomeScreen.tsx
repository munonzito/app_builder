import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton, ProjectCard, TypewriterText } from '../components/common';
import { CreateProjectModal, HomeHeader, QuickActions } from '../components/home';
import { useAuth, useProjects } from '../providers';
import { useAnimationSequence } from '../hooks/useAnimationSequence';
import { RootStackParamList } from '../navigation/types';
import { AppColors, AppSpacing, AppTypography } from '../utils/styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { projects, loadProjects, createProject, deleteProject, isLoading } = useProjects();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const animation = useAnimationSequence();

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [])
  );

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;

    setIsCreating(true);
    const project = await createProject(projectName.trim());
    setIsCreating(false);
    setShowCreateModal(false);
    setProjectName('');

    if (project) {
      navigation.navigate('Builder', { projectId: project.id });
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setProjectName('');
  };

  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const recentProjects = projects.slice(0, 4);

  return (
    <View style={styles.container}>
      <HomeHeader onSettingsPress={() => navigation.navigate('Settings')} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeRow}>
            <Text style={styles.welcomePrefix}>{'>'}</Text>
            <Text style={styles.welcomeBack}>Welcome back,</Text>
          </View>
          {!animation.hasAnimatedName ? (
            <TypewriterText
              text={userName}
              style={styles.userName}
              typingSpeed={120}
              onComplete={animation.onNameAnimationComplete}
            />
          ) : (
            <Text style={styles.userName}>{userName}</Text>
          )}
          <View style={{ height: AppSpacing.md }} />
          {animation.showDescription &&
            (!animation.hasAnimatedDescription ? (
              <TypewriterText
                text="What are we building today?"
                style={styles.welcomeQuestion}
                typingSpeed={30}
                onComplete={animation.onDescriptionAnimationComplete}
              />
            ) : (
              <Text style={styles.welcomeQuestion}>What are we building today?</Text>
            ))}
        </View>

        {/* Quick Actions */}
        {animation.showQuickActions && (
          <QuickActions
            hasAnimated={animation.hasAnimatedQuickActions}
            onAnimationComplete={animation.onQuickActionsAnimationComplete}
            onNewApp={() => setShowCreateModal(true)}
            onTemplates={() => navigation.navigate('Templates')}
            onMyApps={() => navigation.navigate('Projects')}
          />
        )}

        {/* Recent Projects */}
        {animation.showRecentProjects && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              {!animation.hasAnimatedRecentProjects ? (
                <TypewriterText
                  text="Recent Projects"
                  style={styles.sectionTitle}
                  typingSpeed={80}
                  onComplete={animation.onRecentProjectsAnimationComplete}
                />
              ) : (
                <Text style={styles.sectionTitle}>Recent Projects</Text>
              )}
              {animation.hasAnimatedRecentProjects && projects.length > 0 && (
                <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
                  <Text style={styles.viewAllText}>View all</Text>
                </TouchableOpacity>
              )}
            </View>
            {animation.hasAnimatedRecentProjects &&
              (isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading...</Text>
                </View>
              ) : recentProjects.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="phone-portrait-outline"
                    size={48}
                    color={`${AppColors.textSecondary}80`}
                  />
                  <Text style={styles.emptyTitle}>No projects yet</Text>
                  <Text style={styles.emptySubtitle}>Create your first app to get started</Text>
                  <View style={{ height: AppSpacing.lg }} />
                  <AppButton
                    variant="secondary"
                    onPress={() => setShowCreateModal(true)}
                    icon={<Ionicons name="add" size={18} color={AppColors.primary} />}
                  >
                    Create App
                  </AppButton>
                </View>
              ) : (
                <View style={styles.projectsGrid}>
                  {recentProjects.map((project) => (
                    <View key={project.id} style={styles.projectCardWrapper}>
                      <ProjectCard
                        project={project}
                        onPress={() => navigation.navigate('Builder', { projectId: project.id })}
                        onDelete={() => deleteProject(project.id)}
                      />
                    </View>
                  ))}
                </View>
              ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
        <Ionicons name="add" size={24} color={AppColors.textPrimary} />
        <Text style={styles.fabText}>New App</Text>
      </TouchableOpacity>

      <CreateProjectModal
        visible={showCreateModal}
        projectName={projectName}
        isCreating={isCreating}
        onChangeProjectName={setProjectName}
        onClose={handleCloseModal}
        onCreate={handleCreateProject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: AppSpacing.md,
    paddingBottom: 100,
  },
  welcomeSection: {
    backgroundColor: AppColors.surface,
    borderRadius: AppSpacing.borderRadius,
    borderWidth: 1,
    borderColor: `${AppColors.inputBorder}4D`,
    padding: AppSpacing.lg,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomePrefix: {
    ...AppTypography.h1,
    color: AppColors.primary,
    fontWeight: 'bold',
    fontSize: 32,
    marginRight: AppSpacing.sm,
  },
  welcomeBack: {
    ...AppTypography.bodySmall,
    color: AppColors.textSecondary,
  },
  userName: {
    ...AppTypography.h2,
    marginTop: AppSpacing.xs,
  },
  welcomeQuestion: {
    ...AppTypography.bodySmall,
    color: AppColors.textSecondary,
  },
  section: {
    marginTop: AppSpacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: AppSpacing.md,
  },
  sectionTitle: {
    ...AppTypography.h3,
  },
  viewAllText: {
    ...AppTypography.monoSmall,
    color: AppColors.primary,
  },
  loadingContainer: {
    padding: AppSpacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...AppTypography.mono,
    color: AppColors.textSecondary,
  },
  emptyState: {
    backgroundColor: AppColors.surface,
    borderRadius: AppSpacing.borderRadius,
    borderWidth: 1,
    borderColor: `${AppColors.inputBorder}4D`,
    padding: AppSpacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...AppTypography.mono,
    marginTop: AppSpacing.md,
  },
  emptySubtitle: {
    ...AppTypography.monoSmall,
    color: AppColors.textSecondary,
    marginTop: AppSpacing.sm,
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing.md,
  },
  projectCardWrapper: {
    width: (Dimensions.get('window').width - AppSpacing.md * 3) / 2,
    aspectRatio: 0.85,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    ...AppTypography.mono,
    color: AppColors.textPrimary,
    marginLeft: AppSpacing.sm,
  },
});
