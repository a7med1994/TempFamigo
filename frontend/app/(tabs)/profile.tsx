import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../../store/useStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/NewTheme';

export default function ProfileScreen() {
  const { user, setUser, favorites } = useStore();
  const [isEditing, setIsEditing] = useState(!user);
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.location?.city || '');
  const [kidsAges, setKidsAges] = useState(user?.kidsAges?.join(', ') || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to upload a photo'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setAvatar(imageUri);
        
        if (user) {
          const updatedUser = { ...user, avatar: imageUri };
          setUser(updatedUser);
        }
        
        Alert.alert('Success', 'Profile photo updated!');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = () => {
    if (!name || !city) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const agesArray = kidsAges.split(',').map(age => parseInt(age.trim())).filter(age => !isNaN(age));
    
    const newUser = {
      id: user?.id || `user_${Date.now()}`,
      name,
      kidsAges: agesArray,
      location: {
        city,
        coordinates: { lat: -37.8136, lng: 144.9631 },
      },
      avatar: avatar || user?.avatar,
    };

    setUser(newUser);
    setIsEditing(false);
    Alert.alert('Success', 'Profile saved successfully!');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
            {avatar || user?.avatar ? (
              <Image source={{ uri: avatar || user?.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color={Colors.primary} />
              </View>
            )}
            <View style={styles.editAvatarBadge}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.uploadHint}>Tap to upload photo</Text>
          {!isEditing && user && (
            <View style={styles.headerInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userLocation}>{user.location.city}</Text>
            </View>
          )}
        </View>

        {isEditing ? (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Complete Your Profile</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Melbourne"
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kids Ages (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 3, 7, 10"
                value={kidsAges}
                onChangeText={setKidsAges}
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="pencil" size={18} color={Colors.primary} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.favoritesCard}
              onPress={() => router.push('/favorites')}
            >
              <View style={styles.favoritesHeader}>
                <Ionicons name="heart" size={24} color={Colors.primary} />
                <Text style={styles.favoritesTitle}>Favorite Spots</Text>
              </View>
              <Text style={styles.favoritesCount}>
                {favorites.length} {favorites.length === 1 ? 'place' : 'places'} saved
              </Text>
              <View style={styles.favoritesArrow}>
                <Ionicons name="chevron-forward" size={20} color={Colors.medium} />
              </View>
            </TouchableOpacity>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Kids Ages</Text>
              <View style={styles.ageChips}>
                {user?.kidsAges?.map((age, index) => (
                  <View key={index} style={styles.ageChip}>
                    <Text style={styles.ageChipText}>{age} years</Text>
                  </View>
                ))}
                {(!user?.kidsAges || user.kidsAges.length === 0) && (
                  <Text style={styles.noData}>No ages added</Text>
                )}
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Quick Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="calendar" size={24} color={Colors.primary} />
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Events</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="ticket" size={24} color={Colors.primary} />
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Bookings</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="star" size={24} color={Colors.primary} />
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Reviews</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  uploadHint: {
    ...Typography.caption,
    marginTop: Spacing.sm,
  },
  headerInfo: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  userName: {
    ...Typography.h2,
  },
  userLocation: {
    ...Typography.bodySmall,
    marginTop: Spacing.xs,
  },
  form: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h4,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.bodySmall,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.backgroundGray,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.light,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveButtonText: {
    ...Typography.button,
  },
  profileInfo: {
    gap: Spacing.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  favoritesCard: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
    position: 'relative',
  },
  favoritesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  favoritesTitle: {
    ...Typography.h4,
  },
  favoritesCount: {
    ...Typography.bodySmall,
  },
  favoritesArrow: {
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    marginTop: -10,
  },
  infoSection: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  ageChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  ageChip: {
    backgroundColor: Colors.backgroundGray,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  ageChipText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  noData: {
    ...Typography.bodySmall,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    ...Typography.h2,
    marginTop: Spacing.sm,
  },
  statLabel: {
    ...Typography.caption,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
