import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CommunityScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.comingSoon}>
          <Ionicons name="people" size={64} color="#6366F1" />
          <Text style={styles.title}>Community Features</Text>
          <Text style={styles.subtitle}>Coming Soon!</Text>
          <Text style={styles.description}>
            Connect with other families, join playgroups, and chat with local parents.
          </Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="chatbubbles" size={24} color="#6366F1" />
              <Text style={styles.featureText}>Direct Messaging</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="people-circle" size={24} color="#6366F1" />
              <Text style={styles.featureText}>Family Groups</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="megaphone" size={24} color="#6366F1" />
              <Text style={styles.featureText}>Discussion Forums</Text>
            </View>
          </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  comingSoon: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366F1',
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  featureList: {
    marginTop: 32,
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
});