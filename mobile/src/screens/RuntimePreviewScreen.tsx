import React from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RuntimeScreen } from '../runtime';

type RootStackParamList = {
  RuntimePreview: {
    projectId: string;
  };
};

export function RuntimePreviewScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'RuntimePreview'>>();
  const { projectId } = route.params;

  const handleExit = () => {
    navigation.goBack();
  };

  return <RuntimeScreen projectId={projectId} onExit={handleExit} />;
}
