import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NewsCard } from '@/components/ui/news-card';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { Text } from '@/components/ui/text';
import { palette } from '@/constants/theme';
import { newsItems } from '@/data/mock';

const tabs = ['All', 'School News', 'Gist', 'Events'];

export default function NewsScreen() {
  const [tab, setTab] = useState('All');
  const [items, setItems] = useState(newsItems);
  const [likedIds, setLikedIds] = useState<string[]>([]);

  const toggleLike = (id: string) => {
    const liked = likedIds.includes(id);
    setLikedIds((current) =>
      liked ? current.filter((item) => item !== id) : [...current, id]
    );
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, likes: Math.max(0, item.likes + (liked ? -1 : 1)) }
          : item
      )
    );
  };

  const visibleItems =
    tab === 'All' ? items : items.filter((item) => item.category === tab);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <StatusBar style="dark" />

      <View className="flex-row items-center px-5 pt-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          hitSlop={10}
          onPress={() => router.push('/profile')}
          className="h-9 w-9 items-center justify-center active:opacity-60">
          <Ionicons name="menu" size={23} color={palette.navy} />
        </Pressable>
        <Text weight="semibold" className="ml-2 text-[18px] text-navy">
          News &amp; Gist
        </Text>
      </View>

      <SegmentedTabs
        items={tabs}
        value={tab}
        onChange={setTab}
        variant="soft"
        className="mt-3 px-5"
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 86, gap: 12 }}
        showsVerticalScrollIndicator={false}>
        {visibleItems.length === 0 ? (
          <View className="items-center rounded-2xl border border-line bg-white px-5 py-10">
            <Text weight="semibold" className="text-[13px] text-navy">
              Nothing here yet
            </Text>
            <Text className="mt-1 text-center text-[10.5px] leading-4 text-muted">
              Posts in this category will appear here.
            </Text>
          </View>
        ) : null}

        {visibleItems.map((item) => (
          <NewsCard
            key={item.id}
            item={item}
            liked={likedIds.includes(item.id)}
            onLike={() => toggleLike(item.id)}
            onPress={() =>
              router.push({ pathname: '/comments', params: { id: item.id } })
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
