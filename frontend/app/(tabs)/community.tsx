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
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Colors, Typography, Spacing, BorderRadius, Shadows, REACTIONS } from '../../constants/NewTheme';
import api from '../../utils/api';
import ReactionPicker from '../../components/ReactionPicker';

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
  user_reaction?: string;
}

interface Comment {
  id: string;
  user_name: string;
  user_avatar?: string;
  comment: string;
  created_at: string;
}

export default function CommunityScreen() {
  const { user } = useStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showCommentsModal, setShowCommentsModal] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

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

  const fetchComments = async (postId: string) => {
    try {
      setLoadingComments(true);
      const response = await api.get(`/posts/${postId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleReaction = async (postId: string, reactionId: string) => {
    if (!user?.id) {
      alert('Please complete your profile first');
      return;
    }

    try {
      await api.post(`/posts/${postId}/like`, {
        user_id: user.id,
        user_name: user.name,
        reaction_type: reactionId,
      });
      
      // Update local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, user_reaction: reactionId, likes: post.likes + 1 };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user?.id || !commentText.trim()) {
      return;
    }

    try {
      await api.post(`/posts/${postId}/comment`, {
        user_id: user.id,
        user_name: user.name,
        comment: commentText,
      });
      
      setCommentText('');
      fetchComments(postId);
      
      // Update comment count
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, comment_count: post.comment_count + 1 };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleOpenComments = (postId: string) => {
    setShowCommentsModal(postId);
    fetchComments(postId);
  };

  const renderPost = (post: Post) => {
    const postId = post.id || (post as any)._id;
    const userReaction = REACTIONS.find(r => r.id === post.user_reaction);

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
            <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textLight} />
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
          <View style={styles.reactionContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                if (post.user_reaction) {
                  handleReaction(postId, post.user_reaction);
                } else {
                  setShowReactionPicker(postId);
                }
              }}
              onLongPress={() => setShowReactionPicker(postId)}
            >
              {userReaction ? (
                <Text style={styles.reactionEmoji}>{userReaction.emoji}</Text>
              ) : (
                <Ionicons name="heart-outline" size={22} color={Colors.textDark} />
              )}
              <Text style={styles.actionText}>{post.likes} {userReaction?.label || 'Like'}</Text>
            </TouchableOpacity>

            {showReactionPicker === postId && (
              <ReactionPicker
                visible={true}
                selectedReaction={post.user_reaction}
                onSelect={(reactionId) => handleReaction(postId, reactionId)}
                onClose={() => setShowReactionPicker(null)}
              />
            )}
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleOpenComments(postId)}
          >
            <Ionicons name="chatbubble-outline" size={22} color={Colors.textDark} />
            <Text style={styles.actionText}>{post.comment_count} comments</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={22} color={Colors.textDark} />
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
              <Ionicons name="people-outline" size={64} color={Colors.border} />
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

      {/* Comments Modal */}
      <Modal
        visible={showCommentsModal !== null}
        animationType="slide"
        onRequestClose={() => setShowCommentsModal(null)}
      >
        <KeyboardAvoidingView
          style={styles.commentsModal}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.commentsHeader}>
            <TouchableOpacity
              onPress={() => setShowCommentsModal(null)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={Colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.commentsTitle}>Comments</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.commentsList}>
            {loadingComments ? (
              <Text style={styles.loadingText}>Loading comments...</Text>
            ) : comments.length === 0 ? (
              <View style={styles.emptyComments}>
                <Text style={styles.emptyCommentsText}>No comments yet. Be the first!</Text>
              </View>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  {comment.user_avatar ? (
                    <Image source={{ uri: comment.user_avatar }} style={styles.commentAvatar} />
                  ) : (
                    <View style={styles.commentAvatarPlaceholder}>
                      <Ionicons name="person" size={16} color={Colors.primary} />
                    </View>
                  )}
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUserName}>{comment.user_name}</Text>
                    <Text style={styles.commentText}>{comment.comment}</Text>
                    <Text style={styles.commentTime}>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              placeholderTextColor={Colors.textLight}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => showCommentsModal && handleAddComment(showCommentsModal)}
              disabled={!commentText.trim()}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={commentText.trim() ? Colors.primary : Colors.textLight} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingBottom: 80,
  },
  createPostSection: {
    backgroundColor: Colors.backgroundCard,
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
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createPostInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  createPostPlaceholder: {
    ...Typography.body,
    color: Colors.textLight,
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
    backgroundColor: Colors.backgroundCard,
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
    backgroundColor: Colors.background,
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
    borderTopColor: Colors.border,
  },
  reactionContainer: {
    position: 'relative',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionText: {
    ...Typography.bodySmall,
  },
  reactionEmoji: {
    fontSize: 20,
  },
  eventLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
    color: Colors.textLight,
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
  commentsModal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  commentsTitle: {
    ...Typography.h4,
  },
  placeholder: {
    width: 40,
  },
  commentsList: {
    flex: 1,
    padding: Spacing.md,
  },
  emptyComments: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyCommentsText: {
    ...Typography.body,
    color: Colors.textLight,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentContent: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  commentUserName: {
    ...Typography.bodySmall,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  commentText: {
    ...Typography.body,
    marginBottom: Spacing.xs,
  },
  commentTime: {
    ...Typography.caption,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body,
  },
  sendButton: {
    padding: Spacing.sm,
  },
});
