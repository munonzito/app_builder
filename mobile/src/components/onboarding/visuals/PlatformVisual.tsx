import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, AppSpacing } from '../../../utils/styles';

export function PlatformVisual() {
  const glowScale = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const centerScale = useRef(new Animated.Value(0)).current;
  const centerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Glow pulsing
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, { toValue: 1.1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowScale, { toValue: 0.9, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Icons rotation
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    ).start();

    // Center icon fade in
    Animated.parallel([
      Animated.timing(centerScale, { toValue: 1, duration: 600, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
      Animated.timing(centerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <Animated.View style={[styles.glow, { transform: [{ scale: glowScale }] }]} />

      {/* Rotating icons */}
      <Animated.View style={[styles.iconsContainer, { transform: [{ rotate: rotation }] }]}>
        <View style={styles.iconLeft}>
          <Ionicons name="logo-apple" size={80} color="#FFFFFF" />
        </View>
        <View style={styles.iconRight}>
          <Ionicons name="logo-android" size={80} color="#3DDC84" />
        </View>
      </Animated.View>

      {/* Central code icon */}
      <Animated.View style={[styles.centerIcon, { opacity: centerOpacity, transform: [{ scale: centerScale }] }]}>
        <Ionicons name="code" size={32} color={AppColors.primary} />
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
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${AppColors.primary}4D`,
  },
  iconsContainer: {
    position: 'absolute',
    width: 220,
    height: 220,
    justifyContent: 'center',
  },
  iconLeft: {
    position: 'absolute',
    left: 0,
  },
  iconRight: {
    position: 'absolute',
    right: 0,
  },
  centerIcon: {
    backgroundColor: AppColors.surface,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
