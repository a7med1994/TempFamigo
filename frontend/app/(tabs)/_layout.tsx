import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { useStore } from '../../store/useStore';
import { useState } from 'react';

export default function TabsLayout() {
  const { user } = useStore();
  const [showMenu, setShowMenu] = useState(false);

  const HeaderLeft = () => (
    <View style={styles.headerLeft}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => {
          // Toggle a simple menu or navigate
          router.push('/(tabs)/profile');
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