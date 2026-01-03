import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, BackHandler, Dimensions, FlatList } from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { useProjects } from '../providers';
import { RootStackParamList } from '../navigation/types';

type BuilderRouteParams = {
  Builder: {
    projectId: string;
    initialPrompt?: string;
  };
};

interface UseBuilderStateResult {
  navigation: NavigationProp<RootStackParamList>;
  projectId: string;
  initialPrompt: string | undefined;
  inputText: string;
  setInputText: (text: string) => void;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  flatListRef: React.RefObject<FlatList>;
  isSplitView: boolean;
  hasPreview: boolean;
  handleBack: () => boolean;
  handleSubmit: (text?: string) => void;
  scrollToBottom: () => void;
  projectState: ReturnType<typeof useProjects>;
}

export function useBuilderState(): UseBuilderStateResult {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<BuilderRouteParams, 'Builder'>>();
  const { projectId, initialPrompt } = route.params;

  const projectState = useProjects();
  const {
    currentProject,
    messages,
    isGenerating,
    selectProject,
    sendMessage,
    cancelGeneration,
    clearCurrentProject,
  } = projectState;

  const [inputText, setInputText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { width, height } = Dimensions.get('window');
  const isTablet = width >= 768;
  const isLandscape = width > height;
  const isSplitView = isTablet || isLandscape;

  const hasPreview = !!currentProject?.previewUrl;

  useEffect(() => {
    selectProject(projectId);
    return () => {
      clearCurrentProject();
    };
  }, [projectId]);

  useEffect(() => {
    if (initialPrompt && currentProject && messages.length === 0) {
      handleSubmit(initialPrompt);
    }
  }, [currentProject, initialPrompt]);

  const handleBack = useCallback((): boolean => {
    if (!isSplitView && showPreview) {
      setShowPreview(false);
      return true;
    }

    if (isGenerating) {
      Alert.alert(
        'AI is still working',
        'Leaving now will cancel the current generation. Are you sure?',
        [
          { text: 'Stay', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              cancelGeneration();
              clearCurrentProject();
              navigation.goBack();
            },
          },
        ]
      );
      return true;
    }

    clearCurrentProject();
    navigation.goBack();
    return true;
  }, [isSplitView, showPreview, isGenerating, cancelGeneration, clearCurrentProject, navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => backHandler.remove();
  }, [handleBack]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSubmit = useCallback((text?: string) => {
    const messageText = text || inputText;
    if (!messageText.trim()) return;

    setInputText('');
    sendMessage(messageText.trim());
    scrollToBottom();
  }, [inputText, sendMessage, scrollToBottom]);

  return {
    navigation,
    projectId,
    initialPrompt,
    inputText,
    setInputText,
    showPreview,
    setShowPreview,
    flatListRef,
    isSplitView,
    hasPreview,
    handleBack,
    handleSubmit,
    scrollToBottom,
    projectState,
  };
}
