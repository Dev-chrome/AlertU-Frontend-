import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { BackButton, IconButton } from '@/components/ui/buttons';
import { PostCard } from '@/components/ui/post-card';
import { Text } from '@/components/ui/text';
import { images } from '@/constants/images';
import { palette, shadow } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { incidents, pulsePosts } from '@/data/mock';

const quickActions = [
  {
    label: 'Report\nIncident',
    icon: 'home-alert' as const,
    iconColor: '#EE4453',
    bg: 'bg-action-red',
    href: '/report' as const,
  },
  {
    label: 'Map &\nAlerts',
    icon: 'map-marker' as const,
    iconColor: palette.blue,
    bg: 'bg-action-blue',
    href: '/map' as const,
  },
  {
    label: 'Campus\nPulse',
    icon: 'office-building' as const,
    iconColor: '#0E9F6E',
    bg: 'bg-action-green',
    href: '/pulse' as const,
  },
  {
    label: 'News\n& Gist',
    icon: 'newspaper-variant' as const,
    iconColor: '#2563EB',
    bg: 'bg-action-blue',
    href: '/news' as const,
  },
];

export default function HomeScreen() {
  const { user, avatarUri } = useAuth();
  const firstName = user?.name.split(' ')[0] || 'there';
  const liveIncident = incidents[0];
  const latestPost = pulsePosts[0];

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 92 }}
        showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-1">
          <View className="flex-row items-center">
            <BackButton onPress={() => {}} />
            <IconButton
              icon="notifications-outline"
              badge
              accessibilityLabel="Notifications"
              onPress={() => router.push('/notifications')}
              className="ml-2"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              className="ml-auto"
              onPress={() => router.push('/profile')}>
              <Avatar
                source={avatarUri ? { uri: avatarUri } : images.avatarPromise}
                size={36}
                online
              />
            </Pressable>
          </View>

          <View className="mt-3">
            <Text
              weight="semibold"
              className="text-[21px] leading-[28px] tracking-[-0.3px] text-navy">
              Good Morning, {firstName} 👋
            </Text>
            <Text className="mt-1 text-[12px] text-muted">Stay safe, stay informed.</Text>
          </View>

          <View className="mt-5 flex-row gap-2">
            {quickActions.map((action) => (
              <Pressable
                key={action.label}
                accessibilityRole="button"
                accessibilityLabel={action.label.replace('\n', ' ')}
                onPress={() => router.push(action.href)}
                className="flex-1 items-center active:opacity-70">
                <View
                  className={`h-[56px] w-[56px] items-center justify-center rounded-[18px] ${action.bg}`}>
                  <MaterialCommunityIcons
                    name={action.icon}
                    size={25}
                    color={action.iconColor}
                  />
                </View>
                <Text
                  weight="semibold"
                  className="mt-2 text-center text-[10px] leading-[14px] text-navy">
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="mt-6 rounded-[20px] bg-alert-pink p-3.5">
            <View className="flex-row items-center">
              <Text weight="semibold" className="text-[13.5px] text-navy">
                Live Alerts
              </Text>
              <Pressable
                accessibilityLabel="Live alert options"
                hitSlop={10}
                className="ml-auto">
                <Ionicons name="ellipsis-horizontal" size={16} color={palette.red} />
              </Pressable>
            </View>

            {liveIncident ? (
              <View className="mt-2.5 rounded-2xl bg-alert-pink-deep p-3">
                <View className="flex-row items-start">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F4CBD7]">
                    <MaterialCommunityIcons
                      name="map-marker-alert"
                      size={22}
                      color={palette.red}
                    />
                  </View>
                  <View className="ml-2.5 flex-1">
                    <Text weight="semibold" className="text-[12px] leading-[17px] text-navy">
                      {liveIncident.title}
                    </Text>
                    <Text className="mt-0.5 text-[10px] text-[#9B7A84]">
                      {liveIncident.location} · {liveIncident.time}
                    </Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View alert on map"
                  onPress={() => router.push('/map')}
                  className="mt-2.5 self-start rounded-full bg-[#F4CBD7] px-3.5 py-1.5 active:opacity-60">
                  <Text weight="semibold" className="text-[9.5px] text-brand-red">
                    View on Map
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View className="mt-2.5 flex-row items-center rounded-2xl bg-[#E8F7F0] p-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={22}
                    color={palette.green}
                  />
                </View>
                <View className="ml-2.5 flex-1">
                  <Text weight="semibold" className="text-[12px] text-navy">
                    No active alerts
                  </Text>
                  <Text className="mt-0.5 text-[10px] text-muted">
                    Your campus feed is clear right now.
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View className="mt-6 flex-row items-center justify-between">
            <Text weight="semibold" className="text-[16.5px] text-navy">
              Campus Pulse
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="See all campus pulse posts"
              onPress={() => router.push('/pulse')}
              className="flex-row items-center active:opacity-60">
              <Text weight="medium" className="text-[9.5px] text-muted">
                See All
              </Text>
              <Ionicons name="chevron-forward" size={11} color={palette.muted} />
            </Pressable>
          </View>

          {latestPost ? (
            <PostCard
              post={latestPost}
              className="mt-3"
              onComment={() =>
                router.push({ pathname: '/comments', params: { id: latestPost.id } })
              }
            />
          ) : (
            <View className="mt-3 rounded-2xl border border-line bg-white p-4">
              <Text className="text-[11px] leading-5 text-muted">
                No campus posts yet. Be the first to share something.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Report an incident"
        onPress={() => router.push('/report')}
        className="absolute bottom-5 right-5 h-14 w-14 items-center justify-center rounded-full bg-yellow active:opacity-80"
        style={shadow.float}>
        <Ionicons name="create-outline" size={24} color={palette.navy} />
      </Pressable>
    </SafeAreaView>
  );
}
