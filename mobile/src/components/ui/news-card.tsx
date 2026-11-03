import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import type { NewsItem } from '@/data/mock';
import { cn } from '@/lib/cn';
import { palette, shadow } from '@/constants/theme';

import { Text } from './text';

const toneClasses = {
  blue: 'bg-action-blue text-brand-blue',
  orange: 'bg-yellow-100 text-brand-orange',
  red: 'bg-alert-pink text-brand-red',
} as const;

type NewsCardProps = {
  item: NewsItem;
  liked?: boolean;
  onLike?: () => void;
  onPress?: () => void;
};

export function NewsCard({ item, liked = false, onLike, onPress }: NewsCardProps) {
  const tone = toneClasses[item.tone];

  return (
    <View
      className="rounded-2xl border border-white bg-white p-3"
      style={shadow.card}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={item.title}
        className="flex-row active:opacity-90">
        <Image
          source={item.image}
          style={{ width: 88, height: 88, borderRadius: 12 }}
          contentFit="cover"
          transition={150}
        />
        <View className="ml-3 flex-1">
          <View className={cn('self-start rounded-full px-2 py-0.5', tone.split(' ')[0])}>
            <Text weight="medium" className={cn('text-[8.5px]', tone.split(' ')[1])}>
              {item.tag}
            </Text>
          </View>
          <Text
            weight="semibold"
            numberOfLines={2}
            className="mt-1.5 text-[13.5px] leading-[19px] text-navy">
            {item.title}
          </Text>
          <Text numberOfLines={2} className="mt-1 text-[10.5px] leading-[15px] text-muted">
            {item.description}
          </Text>
          <View className="mt-auto flex-row items-center pt-2 pr-14">
            <Text className="text-[9.5px] text-subtle">{item.time}</Text>
          </View>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Like article"
        accessibilityState={{ selected: liked }}
        hitSlop={8}
        onPress={onLike}
        className="absolute bottom-3 right-3 flex-row items-center">
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={14}
          color={liked ? palette.red : palette.muted}
        />
        <Text className="ml-1 text-[10px] text-muted">{item.likes}</Text>
      </Pressable>
    </View>
  );
}
