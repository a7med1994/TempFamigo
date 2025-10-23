import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Colors, Typography, Spacing } from '../constants/TotsuTheme';

export default function TotsuLoadingScreen() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulseAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            easing: Easing.bezier(0.34, 1.56, 0.64, 1),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            easing: Easing.bezier(0.34, 1.56, 0.64, 1),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = [
      createPulseAnimation(dot1, 0),
      createPulseAnimation(dot2, 200),
      createPulseAnimation(dot3, 400),
    ];

    animations.forEach(anim => anim.start());

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, []);

  const getScale = (animValue: Animated.Value) => {
    return animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.5],
    });
  };

  const getTranslateY = (animValue: Animated.Value) => {
    return animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -20],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* TOTSU Logo Text */}
        <Text style={styles.logo}>TOTSU</Text>
        <Text style={styles.slogan}>Parents made for families</Text>

        {/* Three Pulsing Dots */}
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [
                  { scale: getScale(dot1) },
                  { translateY: getTranslateY(dot1) },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [
                  { scale: getScale(dot2) },
                  { translateY: getTranslateY(dot2) },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                transform: [
                  { scale: getScale(dot3) },
                  { translateY: getTranslateY(dot3) },
                ],
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.loadingBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 64,
    fontWeight: '700',
    color: Colors.secondary,
    letterSpacing: 4,
    marginBottom: Spacing.md,
  },
  slogan: {
    fontSize: 16,
    color: Colors.secondary,
    letterSpacing: 2,
    marginBottom: Spacing.xxl,
    textTransform: 'uppercase',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.loadingDot,
  },
});