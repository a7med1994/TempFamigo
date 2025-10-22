import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import api from '../../utils/api';
import { useStore } from '../../store/useStore';

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  date: string;
  location: {
    city: string;
    address?: string;
    coordinates: { lat: number; lng: number };
  };
  host_name: string;
  host_id: string;
  age_range: { min: number; max: number };
  max_participants: number;
  current_participants: number;
  is_public: boolean;
  photos?: string[];
  attendees?: Array<{ id: string; name: string; avatar?: string }>;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRSVPed, setIsRSVPed] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
      
      // Check if user already RSVPed
      if (user?.id) {
        const attendeesResponse = await api.get(`/events/${id}/attendees`);
        const isAttending = attendeesResponse.data.attendees?.some(
          (attendee: any) => attendee.id === user.id
        );
        setIsRSVPed(isAttending);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async () => {
    if (!user?.id) {
      Alert.alert('Login Required', 'Please complete your profile to RSVP');
      return;
    }

    try {
      await api.post(`/events/${id}/rsvp`, {
        user_id: user.id,
        user_name: user.name,
        action: isRSVPed ? 'cancel' : 'join',
      });
      
      setIsRSVPed(!isRSVPed);
      Alert.alert(
        'Success',
        isRSVPed ? 'RSVP cancelled' : 'RSVP confirmed!'
      );
      
      // Refresh event details
      fetchEventDetails();
    } catch (error) {
      console.error('Error with RSVP:', error);
      Alert.alert('Error', 'Failed to process RSVP');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D9773" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#9CA3AF" />
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Event Photo */}
        {event.photos && event.photos.length > 0 ? (
          <Image
            source={{ uri: event.photos[0] }}
            style={styles.eventPhoto}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.eventPhoto, styles.noPhotoPlaceholder]}>
            <Ionicons name="calendar" size={64} color="#9CA3AF" />
          </View>
        )}

        <View style={styles.content}>
          {/* Event Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{event.title}</Text>
              {event.is_public ? (
                <View style={[styles.badge, styles.publicBadge]}>
                  <Text style={styles.badgeText}>Public</Text>
                </View>
              ) : (
                <View style={[styles.badge, styles.privateBadge]}>
                  <Text style={styles.badgeText}>Private</Text>
                </View>
              )}
            </View>
            <Text style={styles.eventType}>{event.event_type}</Text>
          </View>

          {/* Host Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="person-circle" size={24} color="#6D9773" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Hosted by</Text>
                <Text style={styles.infoValue}>{event.host_name}</Text>
              </View>
            </View>
          </View>

          {/* Date & Time */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={24} color="#6D9773" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoValue}>
                  {format(new Date(event.date), 'EEEE, MMM d, yyyy')}
                </Text>
                <Text style={styles.infoValue}>
                  {format(new Date(event.date), 'h:mm a')}
                </Text>
              </View>
            </View>
          </View>

          {/* Location */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={24} color="#6D9773" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>
                  {event.location.address || event.location.city}
                </Text>
              </View>
            </View>
          </View>

          {/* Participants */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="people" size={24} color="#6D9773" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Participants</Text>
                <Text style={styles.infoValue}>
                  {event.current_participants} / {event.max_participants} joined
                </Text>
              </View>
            </View>
          </View>

          {/* Age Range */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Ionicons name="happy" size={24} color="#6D9773" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Age Range</Text>
                <Text style={styles.infoValue}>
                  {event.age_range.min} - {event.age_range.max} years
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <View style={styles.attendeesSection}>
              <Text style={styles.sectionTitle}>
                Attendees ({event.attendees.length})
              </Text>
              <View style={styles.attendeesList}>
                {event.attendees.map((attendee) => (
                  <View key={attendee.id} style={styles.attendeeItem}>
                    {attendee.avatar ? (
                      <Image
                        source={{ uri: attendee.avatar }}
                        style={styles.attendeeAvatar}
                      />
                    ) : (
                      <View style={styles.attendeeAvatarPlaceholder}>
                        <Ionicons name="person" size={20} color="#6D9773" />
                      </View>
                    )}
                    <Text style={styles.attendeeName}>{attendee.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* RSVP Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.rsvpButton,
            isRSVPed && styles.rsvpButtonActive,
            event.current_participants >= event.max_participants &&
              !isRSVPed &&
              styles.rsvpButtonDisabled,
          ]}
          onPress={handleRSVP}
          disabled={
            event.current_participants >= event.max_participants && !isRSVPed
          }
        >
          <Ionicons
            name={isRSVPed ? 'checkmark-circle' : 'add-circle'}
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.rsvpButtonText}>
            {isRSVPed
              ? 'Cancel RSVP'
              : event.current_participants >= event.max_participants
              ? 'Event Full'
              : 'Join Event'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#6D9773',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  eventPhoto: {
    width: '100%',
    height: 250,
    backgroundColor: '#F3F4F6',
  },
  noPhotoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#0C3B2E',
    marginRight: 12,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D9773',
    textTransform: 'uppercase',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  publicBadge: {
    backgroundColor: '#D1FAE5',
  },
  privateBadge: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C3B2E',
  },
  descriptionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C3B2E',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  attendeesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  attendeesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  attendeeItem: {
    alignItems: 'center',
    width: 70,
  },
  attendeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 4,
  },
  attendeeAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F4EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  attendeeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  rsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6D9773',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  rsvpButtonActive: {
    backgroundColor: '#BB8A52',
  },
  rsvpButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  rsvpButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});