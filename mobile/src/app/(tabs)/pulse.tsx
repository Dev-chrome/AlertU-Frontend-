import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/buttons';
import { PostCard } from '@/components/ui/post-card';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { Text } from '@/components/ui/text';
import { pulsePosts } from '@/data/mock';

const tabs = ['Latest', 'Popular', 'Following'];

export default function PulseScreen() {
  const [tab, setTab] = useState('Latest');
  const [posts, setPosts] = useState(pulsePosts);
  const [likedIds, setLikedIds] = useState<string[]>([]);

  const toggleLike = (id: string) => {
    const liked = likedIds.includes(id);
    setLikedIds((current) =>
      liked ? current.filter((item) => item !== id) : [...current, id]
    );
    setPosts((current) =>
      current.map((post) =>
        post.id === id
          ? { ...post, likes: Math.max(0, post.likes + (liked ? -1 : 1)) }
          : post
      )
    );
  };

  const visiblePosts =
    tab === 'Following'
      ? posts.filter((post) => post.verified)
      : tab === 'Popular'
        ? [...posts].sort((a, b) => b.likes - a.likes)
        : posts;

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <StatusBar style="dark" />

      <View className="flex-row items-center px-5 pt-1">
        <BackButton onPress={() => router.push('/home')} />
        <Text weight="semibold" className="ml-2 text-[19px] tracking-[-0.2px] text-navy">
          Campus Pulse
        </Text>
      </View>

      <SegmentedTabs
        items={tabs}
        value={tab}
        onChange={setTab}
        variant="underline"
        className="mt-2 px-3"
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 86, gap: 12 }}
        showsVerticalScrollIndicator={false}>
        {visiblePosts.length === 0 ? (
          <View className="items-center rounded-2xl border border-line bg-white px-5 py-10">
            <Text weight="semibold" className="text-[13px] text-navy">
              Nothing here yet
            </Text>
            <Text className="mt-1 text-center text-[10.5px] leading-4 text-muted">
              {tab === 'Following'
                ? 'Posts from campus moderators will appear here.'
                : 'Campus gists will appear here as students post them.'}
            </Text>
          </View>
        ) : null}

        {visiblePosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            liked={likedIds.includes(post.id)}
            onLike={() => toggleLike(post.id)}
            onComment={() =>
              router.push({ pathname: '/comments', params: { id: post.id } })
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
