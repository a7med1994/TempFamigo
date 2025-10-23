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
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/TotsuTheme';
import api from '../utils/api';

export default function FavoritesScreen() {
  const { user, favorites } = useStore();
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'venue', label: 'Venues' },
    { id: 'event', label: 'Events' },
    { id: 'playground', label: 'Playgrounds' },
    { id: 'childcare', label: 'Childcare' },
  ];

  const filteredFavorites =
    filter === 'all'
      ? favorites
      : favorites.filter((f) => f.item_type === filter);

  const handleItemPress = (item: any) => {
    if (item.item_type === 'event') {
      router.push(`/event/${item.item_id}`);
    } else if (item.item_type === 'venue') {
      router.push(`/venue/${item.item_id}`);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      const { removeFavorite } = useStore.getState();
      await api.post('/favorites/remove', {
        user_id: user?.id,
        item_id: itemId,
      });
      removeFavorite(itemId);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorite Spots</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.filterTab,
              filter === f.id && styles.filterTabActive,
            ]}
            onPress={() => setFilter(f.id)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === f.id && styles.filterTabTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Favorites List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : filteredFavorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={Colors.light} />
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyText}>
              Start exploring and save your favorite spots!
            </Text>
          </View>
        ) : (
          filteredFavorites.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => handleItemPress(item)}
            >
              {item.item_data?.image ? (
                <Image
                  source={{ uri: item.item_data.image }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                  <Ionicons
                    name={item.item_type === 'event' ? 'calendar' : 'location'}
                    size={40}
                    color={Colors.light}
                  />
                </View>
              )}
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.item_data?.title || item.item_data?.name || 'Untitled'}
                    </Text>
                    <Text style={styles.cardType}>{item.item_type}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemove(item.item_id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="heart" size={24} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
                {item.item_data?.location && (
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color={Colors.medium} />
                    <Text style={styles.locationText}>
                      {item.item_data.location.city || item.item_data.location}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h3,
  },
  placeholder: {
    width: 40,
  },
  filterContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light,
  },
  filterContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.backgroundGray,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    ...Typography.bodySmall,
    color: Colors.dark,
  },
  filterTabTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    ...Typography.h3,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.small,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardImagePlaceholder: {
    backgroundColor: Colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
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
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.h4,
    marginBottom: Spacing.xs,
  },
  cardType: {
    ...Typography.caption,
    textTransform: 'uppercase',
    color: Colors.primary,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  locationText: {
    ...Typography.bodySmall,
  },
});