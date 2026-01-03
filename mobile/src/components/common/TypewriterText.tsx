import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextStyle, Animated } from 'react-native';
import { AppColors } from '../../utils/styles';

interface TypewriterTextProps {
  text: string;
  style?: TextStyle;
  typingSpeed?: number;
  cursorColor?: string;
  showCursorAfterComplete?: boolean;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  style,
  typingSpeed = 80,
  cursorColor = AppColors.primary,
  showCursorAfterComplete = false,
  onComplete,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [text, typingSpeed, onComplete]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [cursorOpacity]);

  const showCursor = !isComplete || showCursorAfterComplete;

  return (
    <View style={styles.container}>
      <Text style={style}>{displayedText}</Text>
      {showCursor && (
        <Animated.View
          style={[
            styles.cursor,
            {
              backgroundColor: cursorColor,
              height: style?.fontSize || 24,
              opacity: cursorOpacity,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cursor: {
    width: 3,
    marginLeft: 2,
    borderRadius: 1,
  },
});
