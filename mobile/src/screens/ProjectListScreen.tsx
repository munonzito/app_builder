import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Platform,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton, AppTextField, ProjectCard } from '../components/common';
import { useProjects } from '../providers';
import { AppColors, AppSpacing, AppTypography } from '../utils/styles';

type RootStackParamList = {
  Projects: undefined;
  Builder: { projectId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ProjectListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { projects, loadProjects, createProject, deleteProject, isLoading } = useProjects();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

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

  const handleDeleteProject = (projectId: string) => {
    Alert.alert(
      'Delete Project?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProject(projectId),
        },
      ]
    );
  };

  const numColumns = Math.floor(Dimensions.get('window').width / 200);
  const cardWidth = (Dimensions.get('window').width - AppSpacing.md * (numColumns + 1)) / numColumns;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={AppColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Projects</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color={AppColors.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {projects.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open-outline" size={64} color={`${AppColors.textSecondary}80`} />
          <Text style={styles.emptyTitle}>No projects yet</Text>
          <Text style={styles.emptySubtitle}>Create your first app to get started</Text>
          <View style={{ height: AppSpacing.lg }} />
          <AppButton
            onPress={() => setShowCreateModal(true)}
            icon={<Ionicons name="add" size={18} color={AppColors.textPrimary} />}
          >
            Create Project
          </AppButton>
        </View>
      ) : (
        <FlatList
          data={projects}
          numColumns={numColumns}
          key={numColumns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={AppColors.primary}
            />
          }
          renderItem={({ item }) => (
            <View style={[styles.cardWrapper, { width: cardWidth }]}>
              <ProjectCard
                project={item}
                onPress={() => navigation.navigate('Builder', { projectId: item.id })}
                onDelete={() => handleDeleteProject(item.id)}
              />
            </View>
          )}
        />
      )}

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="add-circle-outline" size={20} color={AppColors.primary} />
              <Text style={styles.modalTitle}>New Project</Text>
            </View>
            <AppTextField
              placeholder="Project name"
              value={projectName}
              onChangeText={setProjectName}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowCreateModal(false);
                  setProjectName('');
                }}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCreateProject}
                disabled={isCreating}
              >
                <Text style={styles.modalButtonTextPrimary}>
                  {isCreating ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    padding: AppSpacing.xs,
  },
  listContent: {
    padding: AppSpacing.md,
  },
  cardWrapper: {
    aspectRatio: 0.85,
    margin: AppSpacing.md / 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: AppSpacing.xl,
  },
  emptyTitle: {
    ...AppTypography.h3,
    marginTop: AppSpacing.md,
  },
  emptySubtitle: {
    ...AppTypography.bodySmall,
    color: AppColors.textSecondary,
    marginTop: AppSpacing.sm,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: AppSpacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: AppColors.surface,
    borderRadius: AppSpacing.borderRadius,
    borderWidth: 1,
    borderColor: `${AppColors.primary}4D`,
    padding: AppSpacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppSpacing.md,
  },
  modalTitle: {
    ...AppTypography.mono,
    fontWeight: '600',
    marginLeft: AppSpacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: AppSpacing.sm,
    marginTop: AppSpacing.lg,
  },
  modalButton: {
    backgroundColor: `${AppColors.primary}1A`,
    borderRadius: AppSpacing.borderRadius,
    borderWidth: 1,
    borderColor: `${AppColors.primary}4D`,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.sm,
  },
  modalButtonTextSecondary: {
    ...AppTypography.monoSmall,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
    ...AppTypography.monoSmall,
    color: AppColors.primary,
    fontWeight: '600',
  },
});
