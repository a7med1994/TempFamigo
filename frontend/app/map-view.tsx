import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useStore } from '../store/useStore';
import api from '../utils/api';

interface Venue {
  id: string;
  name: string;
  category: string;
  location: any;
  rating: number;
  pricing: any;
}

interface Event {
  id: string;
  title: string;
  location: any;
  date: string;
  host_name: string;
}

export default function MapViewScreen() {
  const { user } = useStore();
  const [userLocation, setUserLocation] = useState<any>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVenues, setShowVenues] = useState(true);
  const [showEvents, setShowEvents] = useState(true);

  useEffect(() => {
    getUserLocation();
    fetchMapData();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please enable location access');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      // Use default location if can't get user location
      setUserLocation({
        latitude: user?.location?.coordinates?.lat || -37.8136,
        longitude: user?.location?.coordinates?.lng || 144.9631,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }
  };

  const fetchMapData = async () => {
    try {
      setLoading(true);
      
      // Fetch venues
      const venuesResponse = await api.get('/venues');
      const venuesData = venuesResponse.data.filter((v: Venue) => 
        v.location?.coordinates?.lat && v.location?.coordinates?.lng
      );
      setVenues(venuesData);

      // Fetch events
      const eventsResponse = await api.get('/events', { params: { is_public: true } });
      const eventsData = eventsResponse.data.filter((e: Event) => 
        e.location?.coordinates?.lat && e.location?.coordinates?.lng
      );
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (category: string) => {
    const colors: any = {
      'Indoor': '#6D9773',
      'Outdoor': '#10B981',
      'Playground': '#FFBA00',
      'Farm': '#BB8A52',
      'Learning': '#3B82F6',
      'Free': '#8B5CF6',
    };
    return colors[category] || '#6D9773';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Near Me</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={getUserLocation} style={styles.locationButton}>
            <Ionicons name="locate" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* List View (Web-compatible) */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6D9773" />
          <Text style={styles.loadingText}>Loading nearby places...</Text>
        </View>
      ) : (
        <ScrollView style={styles.listContainer}>
          {/* Venues Section */}
          {showVenues && venues.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Nearby Venues ({venues.length})</Text>
              {venues.map((venue) => (
                <TouchableOpacity
                  key={venue.id}
                  style={styles.listItem}
                  onPress={() => router.push(`/venue/${venue.id}`)}
                >
                  <View style={[styles.iconCircle, { backgroundColor: getMarkerColor(venue.category) }]}>
                    <Ionicons name="business" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{venue.name}</Text>
                    <Text style={styles.itemCategory}>{venue.category}</Text>
                    <View style={styles.itemMeta}>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#FFBA00" />
                        <Text style={styles.ratingText}>
                          {venue.rating > 0 ? venue.rating.toFixed(1) : 'New'}
                        </Text>
                      </View>
                      <Text style={styles.priceText}>
                        {venue.pricing?.type === 'free' ? 'FREE' : `$${venue.pricing?.amount}`}
                      </Text>
                    </View>
                    {venue.location?.address && (
                      <Text style={styles.itemAddress}>{venue.location.address}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Events Section */}
          {showEvents && events.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📅 Nearby Events ({events.length})</Text>
              {events.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.listItem}
                  onPress={() => router.push(`/event/${event.id}`)}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#3B82F6' }]}>
                    <Ionicons name="calendar" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{event.title}</Text>
                    <Text style={styles.itemHost}>By {event.host_name}</Text>
                    <Text style={styles.itemDate}>
                      {new Date(event.date).toLocaleDateString()}
                    </Text>
                    {event.location?.address && (
                      <Text style={styles.itemAddress}>{event.location.address}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {venues.length === 0 && events.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>No nearby places found</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, showVenues && styles.filterButtonActive]}
          onPress={() => setShowVenues(!showVenues)}
        >
          <Ionicons name="business" size={20} color={showVenues ? '#FFFFFF' : '#6D9773'} />
          <Text style={[styles.filterButtonText, showVenues && styles.filterButtonTextActive]}>
            Venues ({venues.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, showEvents && styles.filterButtonActive]}
          onPress={() => setShowEvents(!showEvents)}
        >
          <Ionicons name="calendar" size={20} color={showEvents ? '#FFFFFF' : '#3B82F6'} />
          <Text style={[styles.filterButtonText, showEvents && styles.filterButtonTextActive]}>
            Events ({events.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Map Legend:</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#6D9773' }]} />
          <Text style={styles.legendText}>Venues</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Events</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0C3B2E',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  locationButton: {
    padding: 8,
  },
  listContainer: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0C3B2E',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C3B2E',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6D9773',
    marginBottom: 4,
  },
  itemHost: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0C3B2E',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  itemAddress: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  callout: {
    width: 200,
    padding: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C3B2E',
    marginBottom: 4,
  },
  calloutCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6D9773',
    marginBottom: 4,
  },
  calloutHost: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  calloutDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  calloutRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  calloutRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0C3B2E',
  },
  calloutPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  calloutTap: {
    fontSize: 11,
    color: '#6D9773',
    fontStyle: 'italic',
  },
  filterContainer: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonActive: {
    backgroundColor: '#6D9773',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C3B2E',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  legend: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0C3B2E',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
