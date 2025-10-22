import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { useStore } from '../../store/useStore';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useState } from 'react';
import CustomDrawer from '../../components/CustomDrawer';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';

const Drawer = createDrawerNavigator();

export default function TabsLayout() {
  const { user } = useStore();
  const navigation = useNavigation();

  const HeaderLeft = () => (
    <View style={styles.headerLeft}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => {
          // @ts-ignore
          navigation.dispatch(DrawerActions.openDrawer());
        }}
      >
        <Ionicons name="menu" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const HeaderRight = () => (
    <View style={styles.headerRight}>
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => alert('Notifications - Coming soon!')}
      >
        <Ionicons name="notifications" size={24} color="#FFFFFF" />
        <View style={styles.notificationBadge}>
          <Text style={styles.badgeText}>3</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => router.push('/(tabs)/profile')}
      >
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.headerAvatar} />
        ) : (
          <View style={styles.headerAvatarPlaceholder}>
            <Ionicons name="person" size={20} color="#6D9773" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6D9773',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#0C3B2E',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  menuButton: {
    padding: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFBA00',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#0C3B2E',
    fontSize: 10,
    fontWeight: '700',
  },
  profileButton: {
    padding: 4,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});