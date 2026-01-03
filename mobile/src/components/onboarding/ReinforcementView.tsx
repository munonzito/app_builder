import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { AppButton } from '../common/AppButton';
import { AppBuilderVisual, ExperienceVisual, PlatformVisual } from './visuals';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

interface ReinforcementViewProps {
  reinforcementTitle: string;
  selectedOption: string;
  visualType: 'appBuilder' | 'experience' | 'platform';
  onContinue: () => void;
}

export function ReinforcementView({
  reinforcementTitle,
  selectedOption,
  visualType,
  onContinue,
}: ReinforcementViewProps) {
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(20)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Text animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(textSlide, { toValue: 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start();
    }, 400);

    // Button animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(buttonSlide, { toValue: 0, duration: 400, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
      ]).start();
    }, 1000);
  }, []);

  const title = reinforcementTitle.replace('{answer}', selectedOption);

  const renderVisual = () => {
    switch (visualType) {
      case 'appBuilder':
        return <AppBuilderVisual />;
      case 'experience':
        return <ExperienceVisual />;
      case 'platform':
        return <PlatformVisual />;
    }
  };

  return (
    <View style={styles.container}>
      {renderVisual()}

      <Animated.Text
        style={[
          styles.title,
          { opacity: textFade, transform: [{ translateY: textSlide }] },
        ]}
      >
        {title}
      </Animated.Text>

      <Animated.View
        style={[
          styles.buttonContainer,
          { opacity: buttonFade, transform: [{ translateY: buttonSlide }] },
        ]}
      >
        <AppButton onPress={onContinue} width="100%">
          Continue
        </AppButton>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: AppSpacing.lg,
  },
  title: {
    ...AppTypography.h2,
    textAlign: 'center',
    marginTop: AppSpacing.xl,
  },
  buttonContainer: {
    width: '100%',
    marginTop: AppSpacing.xl * 2,
  },
});
