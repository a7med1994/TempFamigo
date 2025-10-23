import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { useStore } from '../../store/useStore';
import { useDrawer } from '../../contexts/DrawerContext';
import { Colors } from '../../constants/TotsuTheme';

export default function TabsLayout() {
  const { user } = useStore();
  const { openDrawer } = useDrawer();

  const HeaderLeft = () => (
    <View style={styles.headerLeft}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={openDrawer}
      >
        <Ionicons name="menu" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const HeaderRight = () => (
    <View style={styles.headerRight}>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => router.push('/(tabs)/profile')}
      >
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.headerAvatar} />
        ) : (
          <View style={styles.headerAvatarPlaceholder}>
            <Ionicons name="person" size={20} color={Colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.backgroundCard,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
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
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
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