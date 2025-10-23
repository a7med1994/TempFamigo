import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useStore } from '../store/useStore';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/TotsuTheme';

interface CustomDrawerProps {
  onClose: () => void;
}

export default function CustomDrawer({ onClose }: CustomDrawerProps) {
  const { user, favorites } = useStore();

  const menuItems = [
    { id: 'discover', label: 'Discover', icon: 'search', route: '/(tabs)' },
    { id: 'events', label: 'Events', icon: 'calendar-outline', route: '/(tabs)/events' },
    { id: 'community', label: 'Community', icon: 'people-outline', route: '/(tabs)/community' },
    { id: 'favorites', label: 'Favorite Spots', icon: 'heart', route: '/favorites', badge: favorites.length },
    { id: 'bookings', label: 'My Bookings', icon: 'receipt-outline', route: '/bookings' },
    { id: 'profile', label: 'Profile', icon: 'person-outline', route: '/(tabs)/profile' },
  ];

  const handleNavigate = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => handleNavigate('/(tabs)/profile')}
        >
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={Colors.primary} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
        {user?.location?.city && (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={Colors.textLight} />
            <Text style={styles.userLocation}>{user.location.city}</Text>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleNavigate(item.route)}
          >
            <Ionicons name={item.icon as any} size={24} color={Colors.textDark} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            {item.badge !== undefined && item.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.appName}>TOTSU</Text>
        <Text style={styles.tagline}>Parents made for families</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  userLocation: {
    ...Typography.bodySmall,
  },
  menuSection: {
    flex: 1,
    paddingTop: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    position: 'relative',
  },
  menuLabel: {
    ...Typography.body,
    flex: 1,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.backgroundCard,
    fontWeight: '700',
  },
  footer: {
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  appName: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.xs,
    fontWeight: '700',
    letterSpacing: 2,
  },
  tagline: {
    ...Typography.caption,
    color: Colors.textLight,
    letterSpacing: 1,
  },
});