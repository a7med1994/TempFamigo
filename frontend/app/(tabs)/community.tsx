import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/AirbnbTheme';
import api from '../../utils/api';

const isWeb = Platform.OS === 'web';

interface Post {
  id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  photos?: string[];
  event_id?: string;
  likes: number;
  comment_count: number;
  created_at: string;
  post_type: string;
}

export default function CommunityScreen() {
  const { user } = useStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts?is_public=true');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user?.id) {
      alert('Please complete your profile first');
      return;
    }

    try {
      await api.post(`/posts/${postId}/like`, {
        user_id: user.id,
        user_name: user.name,
      });
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const renderPost = (post: Post) => {
    const postId = post.id || (post as any)._id;

    return (
      <View key={postId} style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            {post.user_avatar ? (
              <Image source={{ uri: post.user_avatar }} style={styles.userAvatar} />
            ) : (
              <View style={styles.userAvatarPlaceholder}>
                <Ionicons name="person" size={20} color={Colors.primary} />
              </View>
            )}
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{post.user_name}</Text>
              <Text style={styles.postTime}>
                {new Date(post.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={20} color={Colors.medium} />
          </TouchableOpacity>
        </View>

        {/* Post Content */}
        <Text style={styles.postContent}>{post.content}</Text>

        {/* Post Photos */}
        {post.photos && post.photos.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photosContainer}
          >
            {post.photos.map((photo, index) => (
              <Image key={index} source={{ uri: photo }} style={styles.postPhoto} />
            ))}
          </ScrollView>
        )}

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(postId)}
          >
            <Ionicons name="heart-outline" size={22} color={Colors.dark} />
            <Text style={styles.actionText}>{post.likes} likes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={22} color={Colors.dark} />
            <Text style={styles.actionText}>{post.comment_count} comments</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={22} color={Colors.dark} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Event Link */}
        {post.event_id && (
          <TouchableOpacity
            style={styles.eventLink}
            onPress={() => router.push(`/event/${post.event_id}`)}
          >
            <Ionicons name="calendar" size={16} color={Colors.primary} />
            <Text style={styles.eventLinkText}>View Event Details</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Create Post Section */}
        <View style={styles.createPostSection}>
          <View style={styles.createPostContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.createPostAvatar} />
            ) : (
              <View style={styles.createPostAvatarPlaceholder}>
                <Ionicons name="person" size={20} color={Colors.primary} />
              </View>
            )}
            <TouchableOpacity style={styles.createPostInput}>
              <Text style={styles.createPostPlaceholder}>
                Share your experience...
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.createPostActions}>
            <TouchableOpacity style={styles.createPostAction}>
              <Ionicons name="image-outline" size={20} color={Colors.primary} />
              <Text style={styles.createPostActionText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createPostAction}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <Text style={styles.createPostActionText}>Event</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createPostAction}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
              <Text style={styles.createPostActionText}>Location</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Posts Feed */}
        <View style={styles.feedSection}>
          {loading && posts.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={Colors.light} />
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>
                Be the first to share your experience!
              </Text>
            </View>
          ) : (
            posts.map(renderPost)
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/create-event')}
      >
        <Ionicons name="add" size={28} color={Colors.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  createPostSection: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  createPostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  createPostAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createPostInput: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light,
  },
  createPostPlaceholder: {
    ...Typography.body,
    color: Colors.medium,
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  createPostAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  createPostActionText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  feedSection: {
    gap: Spacing.sm,
  },
  postCard: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    gap: Spacing.xs,
  },
  userName: {
    ...Typography.body,
    fontWeight: '600',
  },
  postTime: {
    ...Typography.caption,
  },
  postContent: {
    ...Typography.body,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  photosContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  postPhoto: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.md,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionText: {
    ...Typography.bodySmall,
  },
  eventLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light,
  },
  eventLinkText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.medium,
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
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
  fab: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.large,
  },
});