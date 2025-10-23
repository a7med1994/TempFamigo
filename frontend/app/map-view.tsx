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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);

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
      
      // Calculate category counts - show total venues + events for each category
      const counts: Record<string, number> = {};
      
      // Initialize all categories with 0
      CATEGORIES.forEach(cat => {
        if (cat.id !== 'all') {
          counts[cat.id] = 0;
        }
      });
      
      // For simplicity, show total of venues and events combined for each category card
      // This gives users a sense of content availability
      counts['playgrounds'] = venuesRes.data.filter((v: any) => 
        v.category && (v.category.toLowerCase().includes('playground') || v.category.toLowerCase() === 'play')
      ).length;
      
      counts['softplay'] = venuesRes.data.filter((v: any) => 
        v.category && (v.category.toLowerCase().includes('indoor') || v.category.toLowerCase().includes('soft'))
      ).length;
      
      counts['animals'] = venuesRes.data.filter((v: any) => 
        v.category && (v.category.toLowerCase().includes('farm') || v.category.toLowerCase().includes('animal') || v.category.toLowerCase().includes('nature'))
      ).length;
      
      counts['arts'] = venuesRes.data.filter((v: any) => 
        v.category && (v.category.toLowerCase().includes('art') || v.category.toLowerCase().includes('craft') || v.category.toLowerCase().includes('creative'))
      ).length;
      
      counts['events'] = eventsRes.data.length;
      
      counts['birthday'] = venuesRes.data.filter((v: any) => 
        v.description && v.description.toLowerCase().includes('birthday')
      ).length + eventsRes.data.filter((e: any) => 
        e.event_type && e.event_type.toLowerCase().includes('birthday')
      ).length;
      
      counts['sports'] = venuesRes.data.filter((v: any) => 
        v.category && v.category.toLowerCase().includes('sport')
      ).length;
      
      counts['shopping'] = venuesRes.data.filter((v: any) => 
        v.category && (v.category.toLowerCase().includes('shop') || v.category.toLowerCase().includes('mall'))
      ).length;
      
      counts['creative'] = venuesRes.data.filter((v: any) => 
        v.category && (v.category.toLowerCase().includes('learning') || v.category.toLowerCase().includes('education'))
      ).length;
      
      counts['community'] = venuesRes.data.filter((v: any) => 
        v.category && (v.category.toLowerCase().includes('community') || v.category.toLowerCase() === 'free')
      ).length;
      
      counts['childcare'] = venuesRes.data.filter((v: any) => 
        v.category && (v.category.toLowerCase().includes('childcare') || v.category.toLowerCase().includes('daycare'))
      ).length;
      
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    // Filter venues and events based on category
    let filteredVenues: any[] = [];
    let filteredEvents: any[] = [];
    
    switch(categoryId) {
      case 'playgrounds':
        filteredVenues = venues.filter(v => 
          v.category && (v.category.toLowerCase().includes('playground') || v.category.toLowerCase() === 'play')
        );
        break;
      case 'softplay':
        filteredVenues = venues.filter(v => 
          v.category && (v.category.toLowerCase().includes('indoor') || v.category.toLowerCase().includes('soft'))
        );
        break;
      case 'animals':
        filteredVenues = venues.filter(v => 
          v.category && (v.category.toLowerCase().includes('farm') || v.category.toLowerCase().includes('animal') || v.category.toLowerCase().includes('nature'))
        );
        break;
      case 'arts':
        filteredVenues = venues.filter(v => 
          v.category && (v.category.toLowerCase().includes('art') || v.category.toLowerCase().includes('craft') || v.category.toLowerCase().includes('creative'))
        );
        break;
      case 'events':
        filteredEvents = events;
        break;
      case 'birthday':
        filteredVenues = venues.filter(v => v.description && v.description.toLowerCase().includes('birthday'));
        filteredEvents = events.filter(e => e.event_type && e.event_type.toLowerCase().includes('birthday'));
        break;
      case 'sports':
        filteredVenues = venues.filter(v => v.category && v.category.toLowerCase().includes('sport'));
        break;
      case 'creative':
        filteredVenues = venues.filter(v => 
          v.category && (v.category.toLowerCase().includes('learning') || v.category.toLowerCase().includes('education'))
        );
        break;
      case 'community':
        filteredVenues = venues.filter(v => 
          v.category && (v.category.toLowerCase().includes('community') || v.category.toLowerCase() === 'free')
        );
        break;
      case 'childcare':
        filteredVenues = venues.filter(v => 
          v.category && (v.category.toLowerCase().includes('childcare') || v.category.toLowerCase().includes('daycare'))
        );
        break;
      default:
        filteredVenues = venues;
        filteredEvents = events;
    }
    
    // Combine and mark type
    const combined = [
      ...filteredVenues.map(v => ({ ...v, itemType: 'venue' })),
      ...filteredEvents.map(e => ({ ...e, itemType: 'event' }))
    ];
    
    setFilteredItems(combined);
  };
  
  const handleBackFromList = () => {
    setSelectedCategory(null);
    setFilteredItems([]);
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
        <TouchableOpacity 
          onPress={() => selectedCategory ? handleBackFromList() : router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.backgroundCard} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedCategory 
            ? CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Category' 
            : 'Browse Categories'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {selectedCategory ? (
        /* List View */
        <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
          {filteredItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={Colors.textLight} />
              <Text style={styles.emptyText}>No items found in this category</Text>
            </View>
          ) : (
            filteredItems.map((item, index) => (
              <TouchableOpacity
                key={`${item.itemType}-${item.id || item._id}-${index}`}
                style={styles.listItem}
                onPress={() => {
                  if (item.itemType === 'venue') {
                    router.push(`/venue/${item.id || item._id}`);
                  } else {
                    router.push(`/event/${item.id || item._id}`);
                  }
                }}
              >
                <View style={styles.listItemIconContainer}>
                  <Ionicons 
                    name={item.itemType === 'venue' ? 'business' : 'calendar'} 
                    size={24} 
                    color={Colors.primary} 
                  />
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>
                    {item.itemType === 'venue' ? item.name : item.title}
                  </Text>
                  <Text style={styles.listItemSubtitle}>
                    {item.itemType === 'venue' ? item.category : new Date(item.date).toLocaleDateString()}
                  </Text>
                  {item.location?.address && (
                    <Text style={styles.listItemAddress}>{item.location.address}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      ) : (
        <>
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
            // Show "New to You" for categories with Events or high recent activity
            const isNew = category.id === 'events' || category.id === 'birthday';
            
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
                {isNew && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
        </>
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
  placeholder: {
    width: 40,
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
  newBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.backgroundCard,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textDark,
    letterSpacing: 0.5,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  listItemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    ...Typography.body,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  listItemSubtitle: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  listItemAddress: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textLight,
    marginTop: Spacing.md,
  },
});
