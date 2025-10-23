import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows, REACTIONS } from '../constants/TotsuTheme';

interface ReactionPickerProps {
  visible: boolean;
  onSelect: (reactionId: string) => void;
  onClose: () => void;
  selectedReaction?: string;
}

export default function ReactionPicker({
  visible,
  onSelect,
  onClose,
  selectedReaction,
}: ReactionPickerProps) {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.reactionsRow}>
          {REACTIONS.map((reaction, index) => {
            const isSelected = selectedReaction === reaction.id;
            return (
              <TouchableOpacity
                key={reaction.id}
                style={[
                  styles.reactionButton,
                  isSelected && styles.reactionButtonSelected,
                ]}
                onPress={() => {
                  onSelect(reaction.id);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Animated.Text
                  style={[
                    styles.reactionEmoji,
                    isSelected && styles.reactionEmojiSelected,
                  ]}
                >
                  {reaction.emoji}
                </Animated.Text>
                {isSelected && (
                  <Text style={styles.reactionLabel}>{reaction.label}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: Colors.reactionBg,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Shadows.large,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
      },
    }),
  },
  reactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  reactionButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  reactionButtonSelected: {
    backgroundColor: Colors.background,
  },
  reactionEmoji: {
    fontSize: 32,
  },
  reactionEmojiSelected: {
    fontSize: 28,
  },
  reactionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMedium,
    marginTop: Spacing.xs,
  },
});