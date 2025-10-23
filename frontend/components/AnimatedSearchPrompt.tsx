import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors, Typography, Spacing, SEARCH_PHRASES } from '../constants/TotsuTheme';

export default function AnimatedSearchPrompt() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Change phrase
        setCurrentPhraseIndex((prev) => (prev + 1) % SEARCH_PHRASES.length);
        
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.text,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {SEARCH_PHRASES[currentPhraseIndex]}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontStyle: 'italic',
  },
});