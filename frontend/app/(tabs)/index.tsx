import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import api from '../../utils/api';
import { CATEGORIES, AGE_RANGES, PRICE_TYPES } from '../../constants/Categories';
import { useStore } from '../../store/useStore';

const { width } = Dimensions.get('window');

// Hero carousel data
const HERO_CARDS = [
  {
    id: '1',
    title: '🎪 Circus in Melbourne this weekend',
    subtitle: 'Amazing acrobats & clowns',
    emoji: '🎪',
    bgColor: '#FFE5E5',
    textColor: '#C7365F',
  },
  {
    id: '2',
    title: '🐮 Visit the Happy Cow Farm',
    subtitle: 'Feed animals & tractor rides',
    emoji: '🐮',
    bgColor: '#E5F5E5',
    textColor: '#2D7A4B',
  },
  {
    id: '3',
    title: '🎂 Host your birthday party',
    subtitle: 'Make it unforgettable!',
    emoji: '🎂',
    bgColor: '#FFF4E5',
    textColor: '#E67E22',
  },
  {
    id: '4',
    title: '🎨 Art & Craft Workshop',
    subtitle: 'Unleash creativity this week',
    emoji: '🎨',
    bgColor: '#F0E5FF',
    textColor: '#7E3AF2',
  },
];

// Quick filter options
const QUICK_FILTERS = [
  { id: 'today', label: 'Today', icon: 'today' },
  { id: 'weekend', label: 'This weekend', icon: 'calendar' },
  { id: 'free', label: 'Free', icon: 'pricetag' },
  { id: 'indoor', label: 'Indoors', icon: 'home' },
  { id: 'toddlers', label: 'Toddlers', icon: 'happy' },
];

interface Venue {
  id: string;
  name: string;
  description: string;
  category: string;
  location: any;
  images: string[];
  pricing: any;
  age_range: any;
  rating: number;
  total_reviews: number;
}

export default function DiscoverScreen() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAgeRange, setSelectedAgeRange] = useState<any>(null);
  const [selectedPriceType, setSelectedPriceType] = useState('all');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string | null>(null);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const heroScrollRef = useRef<FlatList>(null);
  const { user } = useStore();

  // Auto-scroll hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => {
        const nextIndex = (prev + 1) % HERO_CARDS.length;
        heroScrollRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchVenues();
    fetchRecommendations();
  }, [selectedCategory, selectedAgeRange, selectedPriceType]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (selectedAgeRange) {
        params.min_age = selectedAgeRange.min;
        params.max_age = selectedAgeRange.max;
      }
      if (selectedPriceType !== 'all') {
        params.price_type = selectedPriceType;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await api.get('/venues', { params });
      setVenues(response.data);
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await api.post('/recommendations', {
        user_location: user?.location || { city: 'Melbourne', coordinates: { lat: -37.8136, lng: 144.9631 } },
        kids_ages: user?.kidsAges || [5, 8],
        weather: 'sunny',
        time_of_day: new Date().getHours() < 12 ? 'morning' : 'afternoon',
      });
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVenues();
    await fetchRecommendations();
    setRefreshing(false);
  };

  const handleSearch = () => {
    fetchVenues();
  };

  const renderVenueCard = (venue: Venue) => (
    <TouchableOpacity
      key={venue.id}
      style={styles.venueCard}
      onPress={() => router.push(`/venue/${venue.id}`)}
    >
      {venue.images && venue.images.length > 0 ? (
        <Image
          source={{ uri: venue.images[0] }}
          style={styles.venueImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.venueImage, styles.noImagePlaceholder]}>
          <Ionicons name="image-outline" size={40} color="#9CA3AF" />
        </View>
      )}
      
      <View style={styles.venueInfo}>
        <Text style={styles.venueName} numberOfLines={1}>
          {venue.name}
        </Text>
        <Text style={styles.venueCategory}>{venue.category}</Text>
        <Text style={styles.venueDescription} numberOfLines={2}>
          {venue.description}
        </Text>
        
        <View style={styles.venueFooter}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FCD34D" />
            <Text style={styles.ratingText}>
              {venue.rating > 0 ? venue.rating.toFixed(1) : 'New'}
            </Text>
            {venue.total_reviews > 0 && (
              <Text style={styles.reviewCount}>({venue.total_reviews})</Text>
            )}
          </View>
          
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>
              {venue.pricing?.type === 'free' ? 'FREE' : `$${venue.pricing?.amount || 0}`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeroCard = ({ item }: { item: typeof HERO_CARDS[0] }) => (
    <View style={[styles.heroCard, { backgroundColor: item.bgColor }]}>
      <Text style={styles.heroEmoji}>{item.emoji}</Text>
      <Text style={[styles.heroTitle, { color: item.textColor }]}>{item.title}</Text>
      <Text style={[styles.heroSubtitle, { color: item.textColor }]}>{item.subtitle}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Location Header */}
      <View style={styles.locationHeader}>
        <TouchableOpacity style={styles.locationButton}>
          <Ionicons name="location" size={20} color="#6366F1" />
          <Text style={styles.locationText}>
            {user?.location?.city || 'Near me'}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Find activities, playgrounds, farms…"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Quick Filters */}
      <View style={styles.quickFiltersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {QUICK_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.quickFilterChip,
                selectedQuickFilter === filter.id && styles.quickFilterChipActive,
              ]}
              onPress={() =>
                setSelectedQuickFilter(
                  selectedQuickFilter === filter.id ? null : filter.id
                )
              }
            >
              <Ionicons
                name={filter.icon as any}
                size={14}
                color={selectedQuickFilter === filter.id ? '#FFFFFF' : '#6366F1'}
              />
              <Text
                style={[
                  styles.quickFilterText,
                  selectedQuickFilter === filter.id && styles.quickFilterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Hero Carousel */}
        <View style={styles.heroSection}>
          <FlatList
            ref={heroScrollRef}
            data={HERO_CARDS}
            renderItem={renderHeroCard}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / (width - 32)
              );
              setCurrentHeroIndex(index);
            }}
          />
          <View style={styles.heroPagination}>
            {HERO_CARDS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.heroDot,
                  currentHeroIndex === index && styles.heroDotActive,
                ]}
              />
            ))}
          </View>
        </View>
        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles" size={20} color="#6366F1" />
              <Text style={styles.sectionTitle}>AI Picks for You</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Based on weather, time, and your kids' ages
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recommendations.map((rec, index) => {
                const venue = venues.find(v => v.id === rec.venue_id);
                if (!venue) return null;
                return (
                  <View key={index} style={styles.recommendationCard}>
                    {renderVenueCard(venue)}
                    <Text style={styles.recommendationReason}>
                      {rec.reason}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Category Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.filterChip,
                  selectedCategory === category.id && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={selectedCategory === category.id ? '#FFFFFF' : '#6366F1'}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === category.id && styles.filterChipTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Age Range Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age Range</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                !selectedAgeRange && styles.filterChipActive,
              ]}
              onPress={() => setSelectedAgeRange(null)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  !selectedAgeRange && styles.filterChipTextActive,
                ]}
              >
                All Ages
              </Text>
            </TouchableOpacity>
            {AGE_RANGES.map((range) => (
              <TouchableOpacity
                key={range.id}
                style={[
                  styles.filterChip,
                  selectedAgeRange?.id === range.id && styles.filterChipActive,
                ]}
                onPress={() => setSelectedAgeRange(range)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedAgeRange?.id === range.id && styles.filterChipTextActive,
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Price Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PRICE_TYPES.map((price) => (
              <TouchableOpacity
                key={price.id}
                style={[
                  styles.filterChip,
                  selectedPriceType === price.id && styles.filterChipActive,
                ]}
                onPress={() => setSelectedPriceType(price.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedPriceType === price.id && styles.filterChipTextActive,
                  ]}
                >
                  {price.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Venues List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {venues.length} Activities Found
          </Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
            </View>
          ) : venues.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="sad-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No activities found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
            </View>
          ) : (
            <View style={styles.venuesList}>
              {venues.map((venue) => renderVenueCard(venue))}
            </View>
          )}
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
  locationHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  quickFiltersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  quickFilterChipActive: {
    backgroundColor: '#6366F1',
  },
  quickFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  quickFilterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    marginVertical: 16,
    paddingLeft: 16,
  },
  heroCard: {
    width: width - 32,
    height: 160,
    borderRadius: 20,
    padding: 24,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  heroPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  heroDotActive: {
    width: 24,
    backgroundColor: '#6366F1',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: '#6366F1',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 4,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  recommendationCard: {
    width: width * 0.75,
    marginRight: 12,
  },
  recommendationReason: {
    fontSize: 12,
    color: '#6366F1',
    marginTop: 8,
    fontStyle: 'italic',
  },
  venuesList: {
    marginTop: 8,
  },
  venueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  venueImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
  },
  noImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueInfo: {
    padding: 12,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  venueCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  venueDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  venueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  priceTag: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
});