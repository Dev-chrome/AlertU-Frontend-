import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import type { PulsePost } from '@/data/mock';
import { cn } from '@/lib/cn';
import { palette, shadow } from '@/constants/theme';

import { Avatar } from './avatar';
import { Text } from './text';

type PostCardProps = {
  post: PulsePost;
  liked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  className?: string;
};

export function PostCard({
  post,
  liked = false,
  onLike,
  onComment,
  className,
}: PostCardProps) {
  const tagClass =
    post.tag?.tone === 'green'
      ? 'bg-green-50 text-brand-green'
      : 'bg-action-blue text-brand-blue';

  return (
    <View
      className={cn('rounded-2xl border border-white bg-white p-4', className)}
      style={shadow.card}>
      <View className="flex-row items-center">
        <Avatar source={post.avatar} size={42} verified={post.verified} />
        <View className="ml-3 flex-1">
          <View className="flex-row items-center">
            <Text weight="semibold" className="text-[13px] text-navy">
              {post.name}
            </Text>
          </View>
          <Text className="mt-0.5 text-[10.5px] text-subtle">{post.time}</Text>
        </View>
        <Pressable hitSlop={10} accessibilityLabel="Post options">
          <Ionicons name="ellipsis-horizontal" size={18} color={palette.subtle} />
        </Pressable>
      </View>

      <Text className="mt-3 text-[13px] leading-[21px] text-ink/90">{post.content}</Text>

      <View className="mt-3 flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Like post"
          onPress={onLike}
          hitSlop={8}
          className="flex-row items-center">
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={18}
            color={palette.red}
          />
          <Text
            weight="medium"
            className={cn('ml-1.5 text-[11px]', liked ? 'text-brand-red' : 'text-muted')}>
            {post.likes}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View comments"
          onPress={onComment}
          hitSlop={8}
          className="ml-5 flex-row items-center">
          <Ionicons name="chatbubble-outline" size={17} color={palette.muted} />
          <Text weight="medium" className="ml-1.5 text-[11px] text-muted">
            {post.comments}
          </Text>
        </Pressable>

        {post.tag ? (
          <View className={cn('ml-auto rounded-full px-3 py-1', tagClass.split(' ')[0])}>
            <Text weight="medium" className={cn('text-[9.5px]', tagClass.split(' ')[1])}>
              {post.tag.label}
            </Text>
          </View>
        ) : post.reaction ? (
          <Text className="ml-auto text-[16px]">{post.reaction}</Text>
        ) : null}
      </View>
    </View>
  );
}
