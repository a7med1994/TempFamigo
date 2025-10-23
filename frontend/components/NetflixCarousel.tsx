import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Spacing } from '../constants/NewTheme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 280;
const CARD_SPACING = 16;
const AUTO_SCROLL_INTERVAL = 4000; // 4 seconds

interface NetflixCarouselProps {
  children: React.ReactNode[];
  autoScroll?: boolean;
}

export default function NetflixCarousel({
  children,
  autoScroll = true,
}: NetflixCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoScroll && children.length > 1) {
      startAutoScroll();
      return () => stopAutoScroll();
    }
  }, [autoScroll, children.length, currentIndex]);

  const startAutoScroll = () => {
    stopAutoScroll();
    intervalRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % children.length;
      scrollToIndex(nextIndex);
    }, AUTO_SCROLL_INTERVAL);
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollViewRef.current) {
      const offset = index * (CARD_WIDTH + CARD_SPACING);
      scrollViewRef.current.scrollTo({ x: offset, animated: true });
      setCurrentIndex(index);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
        if (index !== currentIndex && index >= 0 && index < children.length) {
          setCurrentIndex(index);
        }
      },
    }
  );

  const handleScrollBeginDrag = () => {
    stopAutoScroll();
  };

  const handleScrollEndDrag = () => {
    if (autoScroll) {
      startAutoScroll();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        {...Platform.select({
          web: {
            // Disable snap on web for smoother scrolling
            snapToInterval: undefined,
          },
        })}
      >
        {children}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {children.map((_, index) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + CARD_SPACING),
            index * (CARD_WIDTH + CARD_SPACING),
            (index + 1) * (CARD_WIDTH + CARD_SPACING),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.4, 0.8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: CARD_SPACING,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E97C6F',
  },
});

export const NETFLIX_CARD_WIDTH = CARD_WIDTH;