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
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as Calendar from 'expo-calendar';
import api from '../../utils/api';
import { useStore } from '../../store/useStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/TotsuTheme';

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
  const { user, isFavorite, addFavorite, removeFavorite } = useStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRSVPed, setIsRSVPed] = useState(false);
  const itemId = id as string;
  const favorited = isFavorite(itemId);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
      
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

  const handleToggleFavorite = async () => {
    if (!user?.id) {
      Alert.alert('Login Required', 'Please complete your profile first');
      return;
    }

    try {
      if (favorited) {
        await api.post('/favorites/remove', {
          user_id: user.id,
          item_id: itemId,
        });
        removeFavorite(itemId);
      } else {
        const favorite = {
          user_id: user.id,
          item_id: itemId,
          item_type: 'event',
          item_data: {
            title: event?.title,
            location: event?.location,
            image: event?.photos?.[0],
          },
        };
        await api.post('/favorites/add', favorite);
        addFavorite({
          id: `${user.id}_${itemId}`,
          item_id: itemId,
          item_type: 'event',
          item_data: favorite.item_data,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleAddToCalendar = async () => {
    if (!event) return;

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant calendar permissions to add this event'
        );
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(
        (cal) => cal.allowsModifications
      ) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert('Error', 'No calendar available');
        return;
      }

      const eventDate = new Date(event.date);
      const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

      await Calendar.createEventAsync(defaultCalendar.id, {
        title: event.title,
        startDate: eventDate,
        endDate: endDate,
        location: event.location.address || event.location.city,
        notes: event.description,
        timeZone: 'Australia/Melbourne',
      });

      Alert.alert('Success', 'Event added to your calendar!');
    } catch (error) {
      console.error('Error adding to calendar:', error);
      Alert.alert('Error', 'Failed to add event to calendar');
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
      
      fetchEventDetails();
    } catch (error) {
      console.error('Error with RSVP:', error);
      Alert.alert('Error', 'Failed to process RSVP');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={Colors.textLight} />
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
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.backgroundCard} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerFavoriteButton}>
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={24}
            color={favorited ? Colors.primary : Colors.backgroundCard}
          />
        </TouchableOpacity>
      </View>

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
            <Ionicons name="calendar" size={64} color={Colors.textLight} />
          </View>
        )}

        <View style={styles.content}>
          {/* Event Header */}
          <View style={styles.eventHeader}>
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

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionCard} onPress={handleAddToCalendar}>
              <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
              <Text style={styles.actionCardText}>Add to Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="share-outline" size={24} color={Colors.primary} />
              <Text style={styles.actionCardText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Host Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-circle-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Hosted by</Text>
                <Text style={styles.infoValue}>{event.host_name}</Text>
              </View>
            </View>
          </View>

          {/* Date & Time */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar" size={24} color={Colors.primary} />
              </View>
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
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={24} color={Colors.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>
                  {event.location.address || event.location.city}
                </Text>
              </View>
            </View>
          </View>

          {/* Participants */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="people" size={24} color={Colors.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Participants</Text>
                <Text style={styles.infoValue}>
                  {event.current_participants} / {event.max_participants} joined
                </Text>
              </View>
            </View>
          </View>

          {/* Age Range */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="happy-outline" size={24} color={Colors.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Age Range</Text>
                <Text style={styles.infoValue}>
                  {event.age_range.min} - {event.age_range.max} years
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <View style={styles.attendeesCard}>
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
                        <Ionicons name="person" size={20} color={Colors.primary} />
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
            name={isRSVPed ? 'checkmark-circle' : 'add-circle-outline'}
            size={24}
            color={Colors.backgroundCard}
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
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  errorText: {
    ...Typography.h4,
    color: Colors.textMedium,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  backButtonText: {
    ...Typography.button,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    ...Platform.select({
      ios: {
        paddingTop: 60,
      },
      android: {
        paddingTop: Spacing.md,
      },
    }),
  },
  headerBackButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.backgroundCard,
  },
  headerFavoriteButton: {
    padding: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  eventPhoto: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.background,
  },
  noPhotoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.md,
  },
  eventHeader: {
    marginBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h2,
    flex: 1,
    marginRight: Spacing.md,
  },
  eventType: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  publicBadge: {
    backgroundColor: Colors.secondary + '20',
  },
  privateBadge: {
    backgroundColor: Colors.primary + '20',
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.textDark,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.small,
  },
  actionCardText: {
    ...Typography.bodySmall,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.caption,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  infoValue: {
    ...Typography.body,
    fontWeight: '600',
  },
  descriptionCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  sectionTitle: {
    ...Typography.h4,
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    lineHeight: 24,
  },
  attendeesCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    ...Shadows.small,
  },
  attendeesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  attendeeItem: {
    alignItems: 'center',
    width: 70,
  },
  attendeeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: Spacing.xs,
  },
  attendeeAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  attendeeName: {
    ...Typography.caption,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: Colors.backgroundCard,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.medium,
  },
  rsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  rsvpButtonActive: {
    backgroundColor: Colors.secondary,
  },
  rsvpButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  rsvpButtonText: {
    ...Typography.button,
  },
});