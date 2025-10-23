import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/AirbnbTheme';
import { CATEGORIES, QUICK_FILTERS } from '../../constants/Categories';
import api from '../../utils/api';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

interface Venue {
  id: string;
  name: string;
  category: string;
  location: { city: string };
  rating: number;
  price_type: string;
  age_range: { min: number; max: number };
  image?: string;
}

interface Event {
  id: string;
  title: string;
  event_type: string;
  date: string;
  location: { city: string };
  current_participants: number;
  max_participants: number;
  photos?: string[];
}

export default function DiscoverScreen() {
  const { user, isFavorite, addFavorite, removeFavorite } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [venuesRes, eventsRes] = await Promise.all([
        api.get('/venues'),
        api.get('/events'),
      ]);
      setVenues(venuesRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (item: any, type: string) => {
    if (!user?.id) {
      alert('Please complete your profile first');
      return;
    }

    const itemId = item.id || item._id;
    
    if (isFavorite(itemId)) {
      await api.post('/favorites/remove', {
        user_id: user.id,
        item_id: itemId,
      });
      removeFavorite(itemId);
    } else {
      const favorite = {
        user_id: user.id,
        item_id: itemId,
        item_type: type,
        item_data: {
          title: item.title || item.name,
          location: item.location,
          image: item.photos?.[0] || item.image,
        },
      };
      await api.post('/favorites/add', favorite);
      addFavorite({
        id: `${user.id}_${itemId}`,
        item_id: itemId,
        item_type: type,
        item_data: favorite.item_data,
        created_at: new Date().toISOString(),
      });
    }
  };

  const renderVenueCard = (venue: Venue) => {
    const itemId = venue.id || (venue as any)._id;
    const favorited = isFavorite(itemId);

    return (
      <TouchableOpacity
        key={itemId}
        style={styles.card}
        onPress={() => router.push(`/venue/${itemId}`)}
        activeOpacity={0.8}
      >
        {venue.image ? (
          <Image source={{ uri: venue.image }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Ionicons name="location" size={40} color={Colors.light} />
          </View>
        )}
        
        {/* Favorite Heart Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleToggleFavorite(venue, 'venue');
          }}
        >
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={24}
            color={favorited ? Colors.primary : Colors.background}
          />
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {venue.name}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFBA00" />
              <Text style={styles.ratingText}>{venue.rating.toFixed(1)}</Text>
            </View>
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color={Colors.medium} />
              <Text style={styles.infoText}>{venue.location.city}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="pricetag-outline" size={14} color={Colors.medium} />
              <Text style={styles.infoText}>{venue.price_type}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEventCard = (event: Event) => {
    const itemId = event.id || (event as any)._id;
    const favorited = isFavorite(itemId);

    return (
      <TouchableOpacity
        key={itemId}
        style={styles.card}
        onPress={() => router.push(`/event/${itemId}`)}
        activeOpacity={0.8}
      >
        {event.photos && event.photos.length > 0 ? (
          <Image source={{ uri: event.photos[0] }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Ionicons name="calendar" size={40} color={Colors.light} />
          </View>
        )}
        
        {/* Favorite Heart Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleToggleFavorite(event, 'event');
          }}
        >
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={24}
            color={favorited ? Colors.primary : Colors.background}
          />
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {event.title}
            </Text>
            <View style={styles.participantsRow}>
              <Ionicons name="people" size={14} color={Colors.medium} />
              <Text style={styles.infoText}>
                {event.current_participants}/{event.max_participants}
              </Text>
            </View>
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color={Colors.medium} />
              <Text style={styles.infoText}>{event.location.city}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={14} color={Colors.medium} />
              <Text style={styles.infoText}>
                {new Date(event.date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.medium} />
            <TextInput
              style={styles.searchInput}
              placeholder="Where do you want to go?"
              placeholderTextColor={Colors.medium}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={20}
                  color={
                    selectedCategory === cat.id ? Colors.background : Colors.dark
                  }
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Discover Amazing Places</Text>
          <Text style={styles.heroSubtitle}>
            Find the perfect activities for your family
          </Text>
        </View>

        {/* Quick Filters */}
        <View style={styles.filtersSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {QUICK_FILTERS.map((filter) => (
              <TouchableOpacity key={filter.id} style={styles.filterChip}>
                <Ionicons name={filter.icon as any} size={16} color={Colors.dark} />
                <Text style={styles.filterText}>{filter.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Venues Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Venues</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
          >
            {venues.slice(0, 10).map(renderVenueCard)}
          </ScrollView>
        </View>

        {/* Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
          >
            {events.slice(0, 10).map(renderEventCard)}
          </ScrollView>
        </View>

        {/* Near Me Button */}
        <TouchableOpacity
          style={styles.nearMeButton}
          onPress={() => router.push('/map-view')}
        >
          <Ionicons name="location" size={20} color={Colors.background} />
          <Text style={styles.nearMeText}>Explore Near Me</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  searchContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  categoriesSection: {
    marginBottom: Spacing.md,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.backgroundGray,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.light,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: Colors.background,
  },
  heroSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  heroTitle: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    ...Typography.body,
    color: Colors.medium,
  },
  filtersSection: {
    marginBottom: Spacing.lg,
  },
  filtersContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.background,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.light,
  },
  filterText: {
    ...Typography.bodySmall,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
  },
  seeAllText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  cardsContainer: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    width: isWeb ? 280 : width * 0.75,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardImagePlaceholder: {
    backgroundColor: Colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  cardContent: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    ...Typography.h4,
    flex: 1,
    marginRight: Spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  ratingText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardInfo: {
    gap: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  infoText: {
    ...Typography.bodySmall,
  },
  nearMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  nearMeText: {
    ...Typography.button,
  },
});