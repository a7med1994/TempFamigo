import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { useStore } from '../../store/useStore';

const { width } = Dimensions.get('window');

interface Venue {
  id: string;
  name: string;
  description: string;
  category: string;
  location: any;
  images: string[];
  pricing: any;
  facilities: string[];
  age_range: any;
  rating: number;
  total_reviews: number;
  contact: any;
}

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useStore();

  useEffect(() => {
    if (id) {
      fetchVenueDetails();
      fetchReviews();
    }
  }, [id]);

  const fetchVenueDetails = async () => {
    try {
      const response = await api.get(`/venues/${id}`);
      setVenue(response.data);
    } catch (error) {
      console.error('Error fetching venue:', error);
      Alert.alert('Error', 'Could not load venue details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/venue/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleBookNow = async () => {
    if (!user) {
      Alert.alert('Profile Required', 'Please complete your profile first to make bookings');
      router.push('/(tabs)/profile');
      return;
    }

    try {
      const response = await api.post('/bookings', {
        user_id: user.id,
        user_name: user.name,
        venue_id: id,
        date: new Date().toISOString(),
        amount: venue?.pricing?.amount || 0,
      });

      // Mock payment confirmation
      await api.put(`/bookings/${response.data.id}/confirm`);

      Alert.alert(
        'Booking Confirmed!',
        `Your ticket code: ${response.data.ticket_code}`,
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Could not complete booking');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!venue) {
    return (
      <View style={styles.errorContainer}>
        <Text>Venue not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageGallery}
        >
          {venue.images && venue.images.length > 0 ? (
            venue.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.image}
                resizeMode="cover"
              />
            ))
          ) : (
            <View style={[styles.image, styles.noImage]}>
              <Ionicons name="image-outline" size={64} color="#9CA3AF" />
            </View>
          )}
        </ScrollView>

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.category}>{venue.category}</Text>
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>
                  {venue.pricing?.type === 'free' ? 'FREE' : `$${venue.pricing?.amount}`}
                </Text>
              </View>
            </View>
            <Text style={styles.venueName}>{venue.name}</Text>
            
            {/* Rating */}
            <View style={styles.ratingRow}>
              <View style={styles.rating}>
                <Ionicons name="star" size={20} color="#FCD34D" />
                <Text style={styles.ratingText}>
                  {venue.rating > 0 ? venue.rating.toFixed(1) : 'New'}
                </Text>
                {venue.total_reviews > 0 && (
                  <Text style={styles.reviewCount}>({venue.total_reviews} reviews)</Text>
                )}
              </View>
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color="#6366F1" />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <Text style={styles.address}>{venue.location.address}</Text>
            <Text style={styles.city}>{venue.location.city}</Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{venue.description}</Text>
          </View>

          {/* Age Range */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="people" size={20} color="#6366F1" />
              <Text style={styles.sectionTitle}>Age Range</Text>
            </View>
            <Text style={styles.ageRange}>
              {venue.age_range.min}-{venue.age_range.max} years old
            </Text>
          </View>

          {/* Facilities */}
          {venue.facilities && venue.facilities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Facilities</Text>
              <View style={styles.facilitiesList}>
                {venue.facilities.map((facility, index) => (
                  <View key={index} style={styles.facilityChip}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                    <Text style={styles.facilityText}>{facility}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contact */}
          {venue.contact && Object.keys(venue.contact).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              {venue.contact.phone && (
                <View style={styles.contactRow}>
                  <Ionicons name="call" size={18} color="#6B7280" />
                  <Text style={styles.contactText}>{venue.contact.phone}</Text>
                </View>
              )}
              {venue.contact.email && (
                <View style={styles.contactRow}>
                  <Ionicons name="mail" size={18} color="#6B7280" />
                  <Text style={styles.contactText}>{venue.contact.email}</Text>
                </View>
              )}
              {venue.contact.website && (
                <View style={styles.contactRow}>
                  <Ionicons name="globe" size={18} color="#6B7280" />
                  <Text style={styles.contactText}>{venue.contact.website}</Text>
                </View>
              )}
            </View>
          )}

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {reviews.length === 0 ? (
              <Text style={styles.noReviews}>No reviews yet. Be the first!</Text>
            ) : (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.user_name}</Text>
                    <View style={styles.reviewRating}>
                      <Ionicons name="star" size={14} color="#FCD34D" />
                      <Text style={styles.reviewRatingText}>{review.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGallery: {
    height: 300,
  },
  image: {
    width,
    height: 300,
  },
  noImage: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  header: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
    textTransform: 'uppercase',
  },
  priceTag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  venueName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  address: {
    fontSize: 14,
    color: '#374151',
  },
  city: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  ageRange: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  facilitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  facilityText: {
    fontSize: 14,
    color: '#065F46',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
  },
  noReviews: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewComment: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookButton: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});