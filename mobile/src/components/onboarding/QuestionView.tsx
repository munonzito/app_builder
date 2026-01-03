import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { AppButton } from '../common/AppButton';
import { AppColors, AppSpacing, AppTypography } from '../../utils/styles';

interface QuestionViewProps {
  question: string;
  options: string[];
  onOptionSelected: (option: string) => void;
}

export function QuestionView({ question, options, onOptionSelected }: QuestionViewProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const optionAnims = options.map(() => ({
    fade: useRef(new Animated.Value(0)).current,
    slide: useRef(new Animated.Value(20)).current,
  }));

  useEffect(() => {
    // Question animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();

    // Options staggered animation
    optionAnims.forEach((anim, index) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(anim.fade, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(anim.slide, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      }, 200 + index * 100);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.question,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {question}
      </Animated.Text>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <Animated.View
            key={option}
            style={[
              styles.optionWrapper,
              {
                opacity: optionAnims[index].fade,
                transform: [{ translateX: optionAnims[index].slide }],
              },
            ]}
          >
            <AppButton
              variant="secondary"
              onPress={() => onOptionSelected(option)}
              width="100%"
            >
              {option}
            </AppButton>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: AppSpacing.lg,
  },
  question: {
    ...AppTypography.h2,
    textAlign: 'center',
    marginBottom: AppSpacing.xl,
  },
  optionsContainer: {
    gap: AppSpacing.md,
  },
  optionWrapper: {
    marginBottom: AppSpacing.md,
  },
});
