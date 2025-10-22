import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';

export default function ProfileScreen() {
  const { user, setUser } = useStore();
  const [isEditing, setIsEditing] = useState(!user);
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.location?.city || '');
  const [kidsAges, setKidsAges] = useState(user?.kidsAges?.join(', ') || '');

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
        coordinates: { lat: -37.8136, lng: 144.9631 }, // Default Melbourne
      },
    };

    setUser(newUser);
    setIsEditing(false);
    Alert.alert('Success', 'Profile saved successfully!');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color="#6D9773" />
          </View>
          {!isEditing && user && (
            <View style={styles.headerInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userLocation}>{user.location.city}</Text>
            </View>
          )}
        </View>

        {/* Edit Form */}
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
              <Text style={styles.label}>Kids' Ages (comma separated)</Text>
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
              <Ionicons name="pencil" size={18} color="#6D9773" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Kids' Ages</Text>
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
                  <Ionicons name="calendar" size={24} color="#6D9773" />
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Events Hosted</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="ticket" size={24} color="#6D9773" />
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Bookings</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="star" size={24} color="#6D9773" />
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
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  userLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  saveButton: {
    backgroundColor: '#6D9773',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    gap: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6D9773',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  ageChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ageChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ageChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D9773',
  },
  noData: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
});