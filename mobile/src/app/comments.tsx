import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/buttons';
import { Text } from '@/components/ui/text';
import { palette, shadow } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import {
  commentsByPostId,
  newsItems,
  pulsePosts,
  type MockComment,
} from '@/data/mock';
import { avatarForName } from '@/lib/adapters';
import { cn } from '@/lib/cn';

type ThreadPost = {
  id: string;
  name: string;
  avatar: ImageSourcePropType;
  time: string;
  title?: string;
  content: string;
  likes: number;
  verified?: boolean;
};

export default function CommentsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const postId = typeof params.id === 'string' ? params.id : undefined;
  const insets = useSafeAreaInsets();
  const { avatarUri } = useAuth();

  const [comments, setComments] = useState<MockComment[]>(() =>
    postId ? (commentsByPostId[postId] ?? []) : []
  );
  const [body, setBody] = useState('');

  const pulsePost = pulsePosts.find((item) => item.id === postId);
  const newsItem = newsItems.find((item) => item.id === postId);

  const thread: ThreadPost | null = pulsePost
    ? {
        id: pulsePost.id,
        name: pulsePost.name,
        avatar: pulsePost.avatar,
        time: pulsePost.time,
        content: pulsePost.content,
        likes: pulsePost.likes,
        verified: pulsePost.verified,
      }
    : newsItem
      ? {
          id: newsItem.id,
          name: 'AlertU News',
          avatar: avatarForName('AlertU News'),
          time: newsItem.time,
          title: newsItem.title,
          content: newsItem.description,
          likes: newsItem.likes,
          verified: true,
        }
      : null;

  const send = () => {
    const message = body.trim();
    if (!message || !postId) return;

    setComments((current) => [
      ...current,
      {
        id: `local-${Date.now()}`,
        postId,
        name: 'You',
        body: message,
        time: 'Just now',
      },
    ]);
    setBody('');
  };

  if (!thread) {
    return (
      <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
        <StatusBar style="dark" />
        <View className="flex-row items-center px-5 pt-1">
          <BackButton onPress={() => router.back()} />
          <Text weight="semibold" className="ml-2 flex-1 text-[19px] text-navy">
            Comments
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-7">
          <Ionicons name="chatbubbles-outline" size={30} color={palette.subtle} />
          <Text weight="semibold" className="mt-3 text-[14px] text-navy">
            Post unavailable
          </Text>
          <Text className="mt-1 text-center text-[10.5px] leading-4 text-muted">
            This post could not be found in the design preview.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <StatusBar style="dark" />
      <View className="flex-row items-center px-5 pt-1">
        <BackButton onPress={() => router.back()} />
        <Text weight="semibold" className="ml-2 flex-1 text-[19px] text-navy">
          Comments
        </Text>
        <Text weight="medium" className="text-[10.5px] text-muted">
          {comments.length}
        </Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 20,
            gap: 10,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View
            className="rounded-2xl border border-white bg-white p-4"
            style={shadow.card}>
            <View className="flex-row items-center">
              <Avatar source={thread.avatar} size={42} verified={thread.verified} />
              <View className="ml-3 flex-1">
                <Text weight="semibold" className="text-[13px] text-navy">
                  {thread.name}
                </Text>
                <Text className="mt-0.5 text-[10px] text-subtle">{thread.time}</Text>
              </View>
            </View>

            {thread.title ? (
              <Text weight="semibold" className="mt-3 text-[14px] leading-5 text-navy">
                {thread.title}
              </Text>
            ) : null}
            <Text className="mt-2 text-[13px] leading-[21px] text-ink/90">
              {thread.content}
            </Text>

            <View className="mt-3 flex-row items-center border-t border-line pt-3">
              <Ionicons name="heart-outline" size={15} color={palette.muted} />
              <Text className="ml-1.5 text-[10.5px] text-muted">{thread.likes}</Text>
              <Ionicons
                name="chatbubble-outline"
                size={14}
                color={palette.muted}
                style={{ marginLeft: 16 }}
              />
              <Text className="ml-1.5 text-[10.5px] text-muted">{comments.length}</Text>
            </View>
          </View>

          {comments.length === 0 ? (
            <View className="items-center rounded-2xl border border-line bg-white px-5 py-10">
              <Ionicons name="chatbubbles-outline" size={26} color={palette.subtle} />
              <Text weight="semibold" className="mt-3 text-[12.5px] text-navy">
                No comments yet
              </Text>
              <Text className="mt-1 text-center text-[10.5px] leading-4 text-muted">
                Start the conversation with a helpful reply.
              </Text>
            </View>
          ) : null}

          {comments.map((comment) => (
            <View
              key={comment.id}
              className="flex-row rounded-2xl border border-white bg-white p-3"
              style={shadow.card}>
              <Avatar
                source={
                  comment.name === 'You' && avatarUri
                    ? { uri: avatarUri }
                    : avatarForName(comment.name)
                }
                size={34}
              />
              <View className="ml-2.5 flex-1">
                <View className="flex-row items-center">
                  <Text weight="semibold" className="text-[11px] text-navy">
                    {comment.name}
                  </Text>
                  {comment.verified ? (
                    <Ionicons
                      name="shield-checkmark"
                      size={11}
                      color={palette.green}
                      style={{ marginLeft: 4 }}
                    />
                  ) : null}
                  <Text className="ml-auto text-[9px] text-subtle">{comment.time}</Text>
                </View>
                <Text className="mt-1 text-[11.5px] leading-5 text-ink/90">
                  {comment.body}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View
          className="border-t border-line bg-white px-4 pt-2.5"
          style={{ paddingBottom: Math.max(insets.bottom, 10) }}>
          <View className="flex-row items-end rounded-2xl border border-line bg-canvas px-3 py-1">
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Add a comment…"
              placeholderTextColor={palette.subtle}
              multiline
              maxLength={1000}
              selectionColor={palette.blue}
              className="max-h-24 min-h-[36px] flex-1 py-2 font-sans text-[12px] leading-[18px] text-ink"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Post comment"
              disabled={!body.trim()}
              onPress={send}
              className={cn(
                'mb-1 ml-2 h-8 w-8 items-center justify-center rounded-full',
                body.trim() ? 'bg-navy active:opacity-70' : 'bg-[#DCE3ED]'
              )}>
              <Ionicons name="arrow-up" size={17} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
