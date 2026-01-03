import { useState, useCallback } from 'react';

interface AnimationState {
  hasAnimatedName: boolean;
  showDescription: boolean;
  hasAnimatedDescription: boolean;
  showQuickActions: boolean;
  hasAnimatedQuickActions: boolean;
  showRecentProjects: boolean;
  hasAnimatedRecentProjects: boolean;
}

interface UseAnimationSequenceResult extends AnimationState {
  onNameAnimationComplete: () => void;
  onDescriptionAnimationComplete: () => void;
  onQuickActionsAnimationComplete: () => void;
  onRecentProjectsAnimationComplete: () => void;
}

export function useAnimationSequence(): UseAnimationSequenceResult {
  const [hasAnimatedName, setHasAnimatedName] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [hasAnimatedDescription, setHasAnimatedDescription] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [hasAnimatedQuickActions, setHasAnimatedQuickActions] = useState(false);
  const [showRecentProjects, setShowRecentProjects] = useState(false);
  const [hasAnimatedRecentProjects, setHasAnimatedRecentProjects] = useState(false);

  const onNameAnimationComplete = useCallback(() => {
    setTimeout(() => {
      setHasAnimatedName(true);
      setShowDescription(true);
    }, 200);
  }, []);

  const onDescriptionAnimationComplete = useCallback(() => {
    setTimeout(() => {
      setHasAnimatedDescription(true);
      setShowQuickActions(true);
    }, 200);
  }, []);

  const onQuickActionsAnimationComplete = useCallback(() => {
    setTimeout(() => {
      setHasAnimatedQuickActions(true);
      setTimeout(() => setShowRecentProjects(true), 300);
    }, 300);
  }, []);

  const onRecentProjectsAnimationComplete = useCallback(() => {
    setHasAnimatedRecentProjects(true);
  }, []);

  return {
    hasAnimatedName,
    showDescription,
    hasAnimatedDescription,
    showQuickActions,
    hasAnimatedQuickActions,
    showRecentProjects,
    hasAnimatedRecentProjects,
    onNameAnimationComplete,
    onDescriptionAnimationComplete,
    onQuickActionsAnimationComplete,
    onRecentProjectsAnimationComplete,
  };
}
