import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useStore } from '../store/useStore';
import api from '../utils/api';

export default function CreateEventScreen() {
  const { user } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState(user?.location?.city || 'Melbourne');
  const [minAge, setMinAge] = useState('0');
  const [maxAge, setMaxAge] = useState('12');
  const [maxParticipants, setMaxParticipants] = useState('20');
  const [isPublic, setIsPublic] = useState(true);

  const handleCreateEvent = async () => {
    if (!user) {
      Alert.alert('Error', 'Please complete your profile first');
      return;
    }

    if (!title || !description || !date || !location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      // Create event date
      const eventDate = new Date(`${date}T${time || '10:00'}`);

      const response = await api.post('/events', {
        title,
        description,
        event_type: 'playdate',
        date: eventDate.toISOString(),
        location: {
          address: location,
          city: city,
          coordinates: user.location.coordinates,
        },
        host_id: user.id,
        host_name: user.name,
        age_range: {
          min: parseInt(minAge),
          max: parseInt(maxAge),
        },
        max_participants: parseInt(maxParticipants),
        is_public: isPublic,
        images: [],
      });

      // Also create a post in community feed
      await api.post('/posts', {
        user_id: user.id,
        user_name: user.name,
        user_avatar: user.avatar || '',
        post_type: 'event_announcement',
        content: `🎉 New event: ${title}\\n\\n${description}\\n\\n📍 ${location}\\n📅 ${date} at ${time || '10:00 AM'}`,
        images: [],
        related_event_id: response.data.id,
        is_public: isPublic,
      });

      Alert.alert('Success!', 'Your event has been created', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Could not create event');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#0C3B2E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Event Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Saturday Playdate at the Park"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell families what to expect..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Date & Time */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="10:00"
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Central Park, Playground Area"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="Melbourne"
              value={city}
              onChangeText={setCity}
            />
          </View>

          {/* Age Range */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age Range</Text>
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <TextInput
                  style={styles.input}
                  placeholder="Min age"
                  value={minAge}
                  onChangeText={setMinAge}
                  keyboardType="number-pad"
                />
              </View>
              <Text style={styles.toText}>to</Text>
              <View style={[styles.inputGroup, styles.flex1]}>
                <TextInput
                  style={styles.input}
                  placeholder="Max age"
                  value={maxAge}
                  onChangeText={setMaxAge}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          {/* Max Participants */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Participants</Text>
            <TextInput
              style={styles.input}
              placeholder="20"
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              keyboardType="number-pad"
            />
          </View>

          {/* Public/Private Toggle */}
          <View style={styles.toggleContainer}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Public Event</Text>
              <Text style={styles.toggleDescription}>
                {isPublic
                  ? 'Everyone nearby can see and join this event'
                  : 'Only people you invite can see this event'}
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: '#D1D5DB', true: '#6D9773' }}
              thumbColor={isPublic ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateEvent}
          >
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C3B2E',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C3B2E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  toText: {
    fontSize: 14,
    color: '#6B7280',
    paddingBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C3B2E',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#6D9773',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
