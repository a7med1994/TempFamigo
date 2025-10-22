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
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStore } from '../store/useStore';
import api from '../utils/api';
import { format } from 'date-fns';

export default function CreateEventScreen() {
  const { user } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [city, setCity] = useState(user?.location?.city || 'Melbourne');
  const [minAge, setMinAge] = useState('0');
  const [maxAge, setMaxAge] = useState('12');
  const [maxParticipants, setMaxParticipants] = useState('20');
  const [isPublic, setIsPublic] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      title.trim() !== '' &&
      description.trim() !== '' &&
      location.trim() !== '' &&
      city.trim() !== '' &&
      minAge.trim() !== '' &&
      maxAge.trim() !== '' &&
      maxParticipants.trim() !== ''
    );
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => 
          `data:image/jpeg;base64,${asset.base64}`
        );
        setImages([...images, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Could not pick image');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleCreateEvent = async () => {
    if (!user) {
      Alert.alert('Error', 'Please complete your profile first');
      return;
    }

    if (!isFormValid()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setIsCreating(true);

      console.log('Creating event with data:', {
        title,
        description,
        date: eventDate.toISOString(),
        location,
      });

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
          min: parseInt(minAge) || 0,
          max: parseInt(maxAge) || 12,
        },
        max_participants: parseInt(maxParticipants) || 20,
        is_public: isPublic,
        images: images,
      });

      console.log('Event created:', response.data);

      // Also create a post in community feed
      const dateStr = format(eventDate, 'MMM d, yyyy');
      const timeStr = format(eventDate, 'h:mm a');
      
      await api.post('/posts', {
        user_id: user.id,
        user_name: user.name,
        user_avatar: user.avatar || '',
        post_type: 'event_announcement',
        content: `🎉 New event: ${title}\n\n${description}\n\n📍 ${location}\n📅 ${dateStr} at ${timeStr}`,
        images: images,
        related_event_id: response.data.id,
        is_public: isPublic,
      });

      console.log('Post created in community feed');

      Alert.alert(
        '🎉 Event Created!', 
        `"${title}" has been created successfully!\n\nYou can see it in the Events tab and Community feed.`,
        [
          { 
            text: 'View Events', 
            onPress: () => {
              router.back();
              // Small delay to ensure navigation completes
              setTimeout(() => {
                router.push('/(tabs)/events');
              }, 100);
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error creating event:', error);
      console.error('Error details:', error.response?.data);
      Alert.alert('Error', `Could not create event: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsCreating(false);
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

          {/* Photo Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Photos (Optional)</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="camera" size={20} color="#6D9773" />
              <Text style={styles.uploadButtonText}>Add Photos</Text>
            </TouchableOpacity>
            
            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreview}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Date & Time Pickers */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Date *</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color="#BB8A52" />
                <Text style={styles.datePickerText}>
                  {format(eventDate, 'MMM d, yyyy')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Time *</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time" size={20} color="#BB8A52" />
                <Text style={styles.datePickerText}>
                  {format(eventDate, 'h:mm a')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date Picker Modal */}
          {showDatePicker && (
            <DateTimePicker
              value={eventDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS
                if (event.type === 'set' && selectedDate) {
                  // Combine selected date with existing time
                  const newDate = new Date(selectedDate);
                  newDate.setHours(eventDate.getHours());
                  newDate.setMinutes(eventDate.getMinutes());
                  setEventDate(newDate);
                  if (Platform.OS !== 'ios') {
                    setShowDatePicker(false);
                  }
                }
              }}
              minimumDate={new Date()}
            />
          )}

          {/* Time Picker Modal */}
          {showTimePicker && (
            <DateTimePicker
              value={eventDate}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(Platform.OS === 'ios'); // Keep open on iOS
                if (event.type === 'set' && selectedTime) {
                  // Combine existing date with selected time
                  const newDate = new Date(eventDate);
                  newDate.setHours(selectedTime.getHours());
                  newDate.setMinutes(selectedTime.getMinutes());
                  setEventDate(newDate);
                  if (Platform.OS !== 'ios') {
                    setShowTimePicker(false);
                  }
                }
              }}
            />
          )}

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
            style={[
              styles.createButton,
              (isCreating || !isFormValid()) && styles.createButtonDisabled
            ]}
            onPress={handleCreateEvent}
            disabled={isCreating || !isFormValid()}
          >
            {isCreating ? (
              <>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.createButtonText}>Creating...</Text>
              </>
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.createButtonText}>
                  {isFormValid() ? 'Create Event' : 'Fill All Required Fields'}
                </Text>
              </>
            )}
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
    color: '#0C3B2E',
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
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  datePickerText: {
    fontSize: 16,
    color: '#0C3B2E',
    fontWeight: '600',
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
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F4EC',
    borderWidth: 2,
    borderColor: '#6D9773',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6D9773',
  },
  imagePreview: {
    marginTop: 12,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
