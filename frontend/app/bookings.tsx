import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/DarkAirbnbTheme';
import api from '../utils/api';

interface Booking {
  id: string;
  venue_name?: string;
  event_title?: string;
  booking_date: string;
  status: string;
  booking_type: string;
  amount?: number;
  venue_id?: string;
  event_id?: string;
}

export default function BookingsScreen() {
  const { user } = useStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Mock bookings for now
      setBookings([
        {
          id: '1',
          event_title: 'Kids Art Workshop',
          booking_date: new Date().toISOString(),
          status: 'confirmed',
          booking_type: 'event',
          amount: 25,
          event_id: '123',
        },
        {
          id: '2',
          venue_name: 'Adventure Playground',
          booking_date: new Date(Date.now() + 86400000).toISOString(),
          status: 'pending',
          booking_type: 'venue',
          amount: 15,
          venue_id: '456',
        },
      ]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return Colors.secondary;
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return Colors.textLight;
      default:
        return Colors.textMedium;
    }
  };

  const handleBookingPress = (booking: Booking) => {
    if (booking.event_id) {
      router.push(`/event/${booking.event_id}`);
    } else if (booking.venue_id) {
      router.push(`/venue/${booking.venue_id}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptyText}>
            Your bookings will appear here once you book an activity
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.exploreButtonText}>Explore Activities</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {bookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.bookingCard}
              onPress={() => handleBookingPress(booking)}
            >
              <View style={styles.bookingHeader}>
                <View style={styles.bookingIcon}>
                  <Ionicons
                    name={booking.booking_type === 'event' ? 'calendar' : 'location'}
                    size={24}
                    color={Colors.primary}
                  />
                </View>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingTitle}>
                    {booking.event_title || booking.venue_name}
                  </Text>
                  <Text style={styles.bookingDate}>
                    {new Date(booking.booking_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingFooter}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(booking.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(booking.status) },
                    ]}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Text>
                </View>
                {booking.amount && (
                  <Text style={styles.amount}>${booking.amount}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h3,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h3,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  exploreButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  exploreButtonText: {
    ...Typography.button,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.md,
  },
  bookingCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  bookingIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    ...Typography.h4,
    marginBottom: Spacing.xs,
  },
  bookingDate: {
    ...Typography.bodySmall,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  amount: {
    ...Typography.h4,
    color: Colors.primary,
  },
});