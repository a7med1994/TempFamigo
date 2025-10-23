import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/TotsuTheme';
import { CATEGORIES } from '../constants/Categories';
import api from '../utils/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with 16px padding and 16px gap

interface CategoryCount {
  category: string;
  count: number;
}

export default function BrowseCategoriesScreen() {
  const [venues, setVenues] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [userLocation, setUserLocation] = useState<any>(null);

  useEffect(() => {
    fetchData();
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please enable location access to see nearby places');
        // Use default location (Melbourne)
        setUserLocation({
          latitude: -37.8136,
          longitude: 144.9631,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
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
      // Use default location
      setUserLocation({
        latitude: -37.8136,
        longitude: 144.9631,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [venuesRes, eventsRes] = await Promise.all([
        api.get('/venues'),
        api.get('/events'),
      ]);
      
      setVenues(venuesRes.data);
      setEvents(eventsRes.data);
      
      // Calculate category counts
      const counts: Record<string, number> = {};
      
      // Count venues by category
      venuesRes.data.forEach((venue: any) => {
        const cat = venue.category.toLowerCase();
        counts[cat] = (counts[cat] || 0) + 1;
      });
      
      // Count events by event_type
      eventsRes.data.forEach((event: any) => {
        const cat = event.event_type.toLowerCase();
        counts[cat] = (counts[cat] || 0) + 1;
      });
      
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isNewItem = (item: any) => {
    if (!item.created_at) return false;
    const created = new Date(item.created_at);
    const now = new Date();
    const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7; // New if created within last 7 days
  };

  const handleCategoryPress = (categoryId: string) => {
    // Navigate back to discover with selected category
    router.push({
      pathname: '/(tabs)',
      params: { category: categoryId },
    });
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      Colors.primary,
      Colors.accent1,
      Colors.accent2,
      '#9C27B0',
      '#FF9800',
      '#00BCD4',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.backgroundCard} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Browse Categories</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.backgroundCard} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'grid' && styles.viewToggleActive]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid" size={20} color={viewMode === 'grid' ? Colors.primary : Colors.backgroundCard} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'map' && styles.viewToggleActive]}
            onPress={() => setViewMode('map')}
          >
            <Ionicons name="map" size={20} color={viewMode === 'map' ? Colors.primary : Colors.backgroundCard} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{venues.length}</Text>
          <Text style={styles.statLabel}>Venues</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{events.length}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{CATEGORIES.length - 1}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
      </View>

      {/* Category Grid */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Explore by Category</Text>
        <View style={styles.grid}>
          {CATEGORIES.filter(cat => cat.id !== 'all').map((category, index) => {
            const count = categoryCounts[category.id] || 0;
            const bgColor = getCategoryColor(index);
            
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: bgColor }]}
                onPress={() => handleCategoryPress(category.id)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryIconContainer}>
                  <Ionicons name={category.icon as any} size={32} color={Colors.backgroundCard} />
                </View>
                <Text style={styles.categoryTitle} numberOfLines={2}>
                  {category.label}
                </Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryCount}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    ...Shadows.medium,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.backgroundCard,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  viewToggle: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  viewToggleActive: {
    backgroundColor: Colors.backgroundCard,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textLight,
    marginTop: Spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    ...Shadows.small,
  },
  statNumber: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  sectionTitle: {
    ...Typography.h2,
    marginBottom: Spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryCard: {
    width: CARD_WIDTH,
    height: 140,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    justifyContent: 'space-between',
    ...Shadows.medium,
    position: 'relative',
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    ...Typography.h4,
    color: Colors.backgroundCard,
    fontWeight: '700',
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    minWidth: 32,
    alignItems: 'center',
  },
  categoryCount: {
    ...Typography.caption,
    color: Colors.textDark,
    fontWeight: '700',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  mapPlaceholderText: {
    ...Typography.body,
    color: Colors.textLight,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  customMarker: {
    alignItems: 'center',
  },
  markerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.backgroundCard,
    ...Shadows.medium,
  },
  newBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.backgroundCard,
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.textDark,
    letterSpacing: 0.5,
  },
  callout: {
    width: 200,
    padding: Spacing.sm,
  },
  calloutTitle: {
    ...Typography.body,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  calloutCategory: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  calloutDate: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  calloutRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calloutRatingText: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
