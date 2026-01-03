import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, AppSpacing } from '../../../utils/styles';

interface SetupLoaderVisualProps {
  phase: number;
}

export function SetupLoaderVisual({ phase }: SetupLoaderVisualProps) {
  return (
    <View style={styles.container}>
      {phase === 0 && <AnalyzingVisual />}
      {phase === 1 && <ConfiguringVisual />}
      {phase === 2 && <BuildingVisual />}
    </View>
  );
}

function AnalyzingVisual() {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 600, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.coreContainer, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.core}>
        <Ionicons name="analytics" size={50} color="#FFFFFF" />
      </View>
    </Animated.View>
  );
}

function ConfiguringVisual() {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.phoneContainer, { opacity: fadeAnim }]}>
      <View style={styles.phone}>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="settings" size={70} color={AppColors.primary} />
        </Animated.View>
        <View style={styles.statusBar} />
      </View>
    </Animated.View>
  );
}

function BuildingVisual() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-10)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const itemsOpacity = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(headerSlide, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(headerOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }, 300);

    itemsOpacity.forEach((anim, index) => {
      setTimeout(() => {
        Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      }, 500 + index * 200);
    });

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(checkScale, { toValue: 1, duration: 600, easing: Easing.out(Easing.elastic(1)), useNativeDriver: true }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }, 1200);
  }, []);

  return (
    <Animated.View style={[styles.phoneContainer, { opacity: fadeAnim }]}>
      <View style={styles.phoneBuild}>
        <Animated.View style={[styles.buildHeader, { opacity: headerOpacity, transform: [{ translateY: headerSlide }] }]} />
        {itemsOpacity.map((anim, index) => (
          <Animated.View key={index} style={[styles.buildItem, { opacity: anim }]} />
        ))}
        <Animated.View style={[styles.checkOverlay, { opacity: checkOpacity, transform: [{ scale: checkScale }] }]}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={50} color="#FFFFFF" />
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 320,
    width: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coreContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  core: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  phoneContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  phone: {
    width: 140,
    height: 240,
    borderWidth: 3,
    borderColor: AppColors.textSecondary,
    borderRadius: 24,
    backgroundColor: AppColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBar: {
    position: 'absolute',
    bottom: 40,
    width: 70,
    height: 6,
    borderRadius: 3,
    backgroundColor: AppColors.success,
  },
  phoneBuild: {
    width: 140,
    height: 240,
    borderWidth: 3,
    borderColor: AppColors.textPrimary,
    borderRadius: 24,
    backgroundColor: AppColors.surface,
    alignItems: 'center',
    paddingTop: 30,
  },
  buildHeader: {
    width: 90,
    height: 15,
    borderRadius: 4,
    backgroundColor: AppColors.primary,
    marginBottom: 15,
  },
  buildItem: {
    width: 90,
    height: 18,
    borderRadius: 4,
    backgroundColor: `${AppColors.textSecondary}4D`,
    marginBottom: 15,
  },
  checkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
