import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { QuestionView, ReinforcementView, SetupLoaderVisual } from '../../components/onboarding';
import { onboardingSteps } from '../../models/onboarding';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showingReinforcement, setShowingReinforcement] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupStatus, setSetupStatus] = useState('');
  const [setupPhase, setSetupPhase] = useState(0);
  const [userChoices, setUserChoices] = useState<Record<number, string>>({});

  const statusOpacity = useRef(new Animated.Value(0)).current;
  const statusSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (isSettingUp) {
      Animated.parallel([
        Animated.timing(statusOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(statusSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [setupStatus]);

  const handleOptionSelected = (option: string) => {
    setSelectedOption(option);
    setUserChoices((prev) => ({ ...prev, [currentIndex]: option }));
    setShowingReinforcement(true);
  };

  const handleContinue = async () => {
    if (currentIndex < onboardingSteps.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowingReinforcement(false);
      setSelectedOption('');
    } else {
      await startSetupSequence();
    }
  };

  const startSetupSequence = async () => {
    setIsSettingUp(true);
    setSetupPhase(0);
    setSetupStatus('Analyzing your preferences...');

    await delay(2000);

    const platform = userChoices[2] || 'mobile';
    setSetupPhase(1);
    animateStatusChange(`Configuring your ${platform} environment...`);

    await delay(2000);

    const appType = userChoices[0] || 'app';
    setSetupPhase(2);
    animateStatusChange(`Drafting your first ${appType} app structure...`);

    await delay(2000);

    animateStatusChange('Ready!');

    await delay(500);

    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const animateStatusChange = (newStatus: string) => {
    statusOpacity.setValue(0);
    statusSlide.setValue(20);
    setSetupStatus(newStatus);
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const progress = (currentIndex + (showingReinforcement ? 1 : 0.5)) / onboardingSteps.length;
  const currentStep = onboardingSteps[currentIndex];

  if (isSettingUp) {
    return (
      <View style={styles.container}>
        <View style={styles.setupContainer}>
          <SetupLoaderVisual phase={setupPhase} />
          <View style={{ height: AppSpacing.xl * 2 }} />
          <Animated.Text
            style={[
              styles.setupStatus,
              { opacity: statusOpacity, transform: [{ translateY: statusSlide }] },
            ]}
          >
            {setupStatus}
          </Animated.Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {/* Content */}
      {showingReinforcement ? (
        <ReinforcementView
          reinforcementTitle={currentStep.reinforcementTitleTemplate}
          selectedOption={selectedOption}
          visualType={currentStep.visualType}
          onContinue={handleContinue}
        />
      ) : (
        <QuestionView
          question={currentStep.question}
          options={currentStep.options}
          onOptionSelected={handleOptionSelected}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  progressContainer: {
    paddingHorizontal: AppSpacing.lg,
    paddingVertical: AppSpacing.md,
    paddingTop: 60,
  },
  progressBackground: {
    height: 4,
    backgroundColor: AppColors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppColors.primary,
    borderRadius: 2,
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setupStatus: {
    ...AppTypography.h3,
    color: AppColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: AppSpacing.lg,
    minHeight: 60,
  },
});
