import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTextField } from '../common';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

interface CreateProjectModalProps {
  visible: boolean;
  projectName: string;
  isCreating: boolean;
  onChangeProjectName: (name: string) => void;
  onClose: () => void;
  onCreate: () => void;
}

export function CreateProjectModal({
  visible,
  projectName,
  isCreating,
  onChangeProjectName,
  onClose,
  onCreate,
}: CreateProjectModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
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
            onChangeText={onChangeProjectName}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={onCreate}
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
  );
}

const styles = StyleSheet.create({
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
