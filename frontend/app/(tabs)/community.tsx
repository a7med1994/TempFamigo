import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { useStore } from '../../store/useStore';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  user_id: string;
  user_name: string;
  post_type: string;
  content: string;
  images: string[];
  likes: number;
  comment_count: number;
  created_at: string;
  related_venue_id?: string;
  related_event_id?: string;
}

export default function CommunityScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const { user } = useStore();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts', { params: { is_public: true } });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      alert('Please complete your profile first');
      return;
    }

    try {
      await api.post(`/posts/${postId}/like`, {
        user_id: user.id,
        user_name: user.name,
        reaction_type: 'like',
      });
      
      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes: post.likes + 1 }
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentPress = async (post: Post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
    
    try {
      const response = await api.get(`/posts/${post.id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !commentText.trim() || !selectedPost) return;

    try {
      const response = await api.post(`/posts/${selectedPost.id}/comments`, {
        post_id: selectedPost.id,
        user_id: user.id,
        user_name: user.name,
        comment: commentText.trim(),
      });

      setComments([...comments, response.data]);
      setCommentText('');
      
      // Update comment count
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === selectedPost.id
            ? { ...post, comment_count: post.comment_count + 1 }
            : post
        )
      );
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'photo_share':
        return 'camera';
      case 'event_announcement':
        return 'calendar';
      case 'recommendation':
        return 'star';
      case 'invitation':
        return 'mail';
      case 'status':
        return 'chatbubble-ellipses';
      default:
        return 'document-text';
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'photo_share':
        return '#8B5CF6';
      case 'event_announcement':
        return '#3B82F6';
      case 'recommendation':
        return '#F59E0B';
      case 'invitation':
        return '#10B981';
      case 'status':
        return '#6B7280';
      default:
        return '#6366F1';
    }
  };

  const renderPost = (post: Post) => (
    <View key={post.id} style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: getPostTypeColor(post.post_type) }]}>
            <Text style={styles.avatarText}>
              {post.user_name.charAt(0)}
            </Text>
          </View>
          <View style={[styles.postTypeBadge, { backgroundColor: getPostTypeColor(post.post_type) }]}>
            <Ionicons name={getPostTypeIcon(post.post_type)} size={10} color="#FFFFFF" />
          </View>
        </View>
        
        <View style={styles.postHeaderInfo}>
          <Text style={styles.userName}>{post.user_name}</Text>
          <Text style={styles.postTime}>
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </Text>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <Text style={styles.postContent}>{post.content}</Text>

      {/* Post Actions */}
      <View style={styles.postActions}>
        <View style={styles.postStats}>
          <Text style={styles.statText}>
            {post.likes} {post.likes === 1 ? 'like' : 'likes'}
          </Text>
          <Text style={styles.statText}>•</Text>
          <Text style={styles.statText}>
            {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(post.id)}
        >
          <Ionicons name="heart-outline" size={20} color="#6366F1" />
          <Text style={styles.actionButtonText}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCommentPress(post)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#6366F1" />
          <Text style={styles.actionButtonText}>Comment</Text>
        </TouchableOpacity>

        {post.post_type === 'invitation' && (
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
            <Text style={[styles.actionButtonText, { color: '#10B981' }]}>Join</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
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
          ) : posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>Be the first to share!</Text>
            </View>
          ) : (
            posts.map((post) => renderPost(post))
          )}
        </View>
      </ScrollView>

      {/* FAB for creating new post */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => alert('Create post feature coming soon!')}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCommentModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setShowCommentModal(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.commentsList}>
              {comments.length === 0 ? (
                <Text style={styles.noComments}>No comments yet. Be the first!</Text>
              ) : (
                comments.map((comment, index) => (
                  <View key={index} style={styles.commentItem}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {comment.user_name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.commentContent}>
                      <Text style={styles.commentUserName}>{comment.user_name}</Text>
                      <Text style={styles.commentText}>{comment.comment}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !commentText.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSubmitComment}
                disabled={!commentText.trim()}
              >
                <Ionicons
                  name="send"
                  size={20}
                  color={commentText.trim() ? '#FFFFFF' : '#9CA3AF'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
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
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  postTypeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  postHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  postTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 12,
  },
  postActions: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  postStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  commentsList: {
    flex: 1,
    padding: 16,
  },
  noComments: {
    textAlign: 'center',
    color: '#9CA3AF',
    paddingVertical: 32,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
    gap: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
});