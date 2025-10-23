import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

  useEffect(() => {
    fetchData();
  }, []);

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
        <Text style={styles.headerTitle}>Browse Categories</Text>
        <View style={styles.placeholder} />
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
