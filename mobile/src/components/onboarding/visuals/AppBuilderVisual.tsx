import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, AppSpacing } from '../../../utils/styles';

export function AppBuilderVisual() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentAnims = [
    { slide: useRef(new Animated.Value(-20)).current, opacity: useRef(new Animated.Value(0)).current },
    { slide: useRef(new Animated.Value(20)).current, opacity: useRef(new Animated.Value(0)).current },
    { slide: useRef(new Animated.Value(-20)).current, opacity: useRef(new Animated.Value(0)).current },
  ];
  const buttonScale = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Phone frame animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
    ]).start();

    // Header animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(headerSlide, { toValue: 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }, 400);

    // Content blocks animation
    contentAnims.forEach((anim, index) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(anim.slide, { toValue: 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim.opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
      }, 600 + index * 200);
    });

    // Button animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonScale, { toValue: 1, duration: 600, easing: Easing.out(Easing.elastic(1)), useNativeDriver: true }),
        Animated.timing(buttonOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }, 1400);
  }, []);

  return (
    <View style={styles.container}>
      {/* Phone Frame */}
      <Animated.View style={[styles.phoneFrame, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Header Block */}
        <Animated.View style={[styles.headerBlock, { opacity: headerOpacity, transform: [{ translateY: headerSlide }] }]} />

        {/* Content Blocks */}
        {contentAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.contentBlock,
              { opacity: anim.opacity, transform: [{ translateX: anim.slide }] },
            ]}
          />
        ))}

        {/* Button */}
        <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity, transform: [{ scale: buttonScale }] }]}>
          <View style={styles.button}>
            <Ionicons name="checkmark" size={36} color="#FFFFFF" />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 320,
    width: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneFrame: {
    width: 180,
    height: 280,
    borderWidth: 3,
    borderColor: AppColors.textSecondary,
    borderRadius: 24,
    alignItems: 'center',
    paddingTop: 50,
  },
  headerBlock: {
    width: 120,
    height: 30,
    backgroundColor: `${AppColors.primary}CC`,
    borderRadius: 6,
    marginBottom: 15,
  },
  contentBlock: {
    width: 120,
    height: 30,
    backgroundColor: AppColors.surface,
    borderRadius: 6,
    marginBottom: 15,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
