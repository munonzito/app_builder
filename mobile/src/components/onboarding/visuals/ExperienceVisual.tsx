import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../../../utils/styles';

export function ExperienceVisual() {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Magic icon pulsing
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Orbit rotation
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Dots fade in
    Animated.timing(dotsOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Outer ring */}
      <View style={styles.outerRing} />

      {/* Orbiting dots */}
      <Animated.View style={[styles.orbitContainer, { opacity: dotsOpacity, transform: [{ rotate: rotation }] }]}>
        <View style={[styles.dot, styles.dotTop]} />
        <View style={[styles.dotAlt, styles.dotRight]} />
        <View style={[styles.dot, styles.dotBottom]} />
        <View style={[styles.dotAlt, styles.dotLeft]} />
      </Animated.View>

      {/* Central magic icon */}
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons name="sparkles" size={120} color={AppColors.primary} />
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
  outerRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: `${AppColors.primary}33`,
  },
  orbitContainer: {
    position: 'absolute',
    width: 260,
    height: 260,
  },
  dot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: AppColors.textPrimary,
  },
  dotAlt: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: AppColors.textSecondary,
  },
  dotTop: {
    top: 0,
    left: '50%',
    marginLeft: -9,
  },
  dotRight: {
    right: 0,
    top: '50%',
    marginTop: -9,
  },
  dotBottom: {
    bottom: 0,
    left: '50%',
    marginLeft: -9,
  },
  dotLeft: {
    left: 0,
    top: '50%',
    marginTop: -9,
  },
  iconContainer: {
    position: 'absolute',
  },
});
