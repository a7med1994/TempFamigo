import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Colors, Typography, Spacing } from '../constants/DarkAirbnbTheme';

export default function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade and scale in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation for loading indicator
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🌳</Text>
          <Text style={styles.appName}>Famigo</Text>
        </View>

        {/* Loading Spinner */}
        <Animated.View
          style={[
            styles.spinner,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <View style={styles.spinnerOuter}>
            <View style={styles.spinnerInner} />
          </View>
        </Animated.View>

        {/* Loading Text */}
        <Text style={styles.loadingText}>Loading amazing activities...</Text>
      </Animated.View>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    fontSize: 80,
    marginBottom: Spacing.md,
  },
  appName: {
    ...Typography.h1,
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
  },
  spinner: {
    marginBottom: Spacing.xl,
  },
  spinnerOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: Colors.border,
    borderTopColor: Colors.loadingAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.loadingBg,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textLight,
  },
});