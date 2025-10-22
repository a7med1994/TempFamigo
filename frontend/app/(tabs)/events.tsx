import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import api from '../../utils/api';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  date: string;
  location: any;
  host_name: string;
  age_range: any;
  max_participants: number;
  current_participants: number;
  is_public: boolean;
}

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filter === 'public') {
        params.is_public = true;
      } else if (filter === 'private') {
        params.is_public = false;
      }

      const response = await api.get('/events', { params });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const renderEventCard = (event: Event) => (
    <TouchableOpacity
      key={event.id}
      style={styles.eventCard}
      onPress={() => router.push(`/event/${event.id}`)}
    >
      <View style={styles.eventHeader}>
        <View style={styles.dateBox}>
          <Text style={styles.dateMonth}>
            {format(new Date(event.date), 'MMM')}
          </Text>
          <Text style={styles.dateDay}>
            {format(new Date(event.date), 'd')}
          </Text>
        </View>
        
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={styles.eventHost}>Hosted by {event.host_name}</Text>
          <View style={styles.eventMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>
                {format(new Date(event.date), 'h:mm a')}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText} numberOfLines={1}>
                {event.location.city}
              </Text>
            </View>
          </View>
        </View>
        
        <View>
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
      </View>
      
      <Text style={styles.eventDescription} numberOfLines={2}>
        {event.description}
      </Text>
      
      <View style={styles.eventFooter}>
        <View style={styles.participantInfo}>
          <Ionicons name="people" size={16} color="#6366F1" />
          <Text style={styles.participantText}>
            {event.current_participants}/{event.max_participants} joined
          </Text>
        </View>
        <View style={styles.ageTag}>
          <Text style={styles.ageText}>
            Ages {event.age_range.min}-{event.age_range.max}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'public' && styles.filterTabActive]}
          onPress={() => setFilter('public')}
        >
          <Text style={[styles.filterText, filter === 'public' && styles.filterTextActive]}>
            Public
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'private' && styles.filterTabActive]}
          onPress={() => setFilter('private')}
        >
          <Text style={[styles.filterText, filter === 'private' && styles.filterTextActive]}>
            Private
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
            </View>
          ) : events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>No events yet</Text>
              <Text style={styles.emptySubtext}>Create your first playdate!</Text>
            </View>
          ) : (
            events.map((event) => renderEventCard(event))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/create-event')}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: '#6366F1',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  filterTextActive: {
    color: '#6366F1',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dateBox: {
    width: 56,
    height: 56,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  eventHost: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  publicBadge: {
    backgroundColor: '#D1FAE5',
  },
  privateBadge: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#065F46',
  },
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  ageTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 80,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6D9773',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});