import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useStore } from '../store/useStore';

export default function CustomDrawer(props: any) {
  const { user } = useStore();

  const menuItems = [
    { id: 'discover', label: 'Discover', icon: 'compass', route: '/(tabs)' },
    { id: 'events', label: 'Events', icon: 'calendar', route: '/(tabs)/events' },
    { id: 'community', label: 'Community', icon: 'people', route: '/(tabs)/community' },
    { id: 'profile', label: 'Profile', icon: 'person', route: '/(tabs)/profile' },
  ];

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.drawerContent}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#6D9773" />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          {user?.location?.city && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color="#BB8A52" />
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
              onPress={() => {
                router.push(item.route);
                props.navigation.closeDrawer();
              }}
            >
              <Ionicons name={item.icon as any} size={24} color="#BB8A52" />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.appName}>🌳 Famigo</Text>
          <Text style={styles.tagline}>Discover. Connect. Play.</Text>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    marginBottom: 12,
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
    backgroundColor: '#E8F4EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C3B2E',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuSection: {
    flex: 1,
    paddingTop: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C3B2E',
  },
  footer: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0C3B2E',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    color: '#6D9773',
    fontWeight: '600',
  },
});
