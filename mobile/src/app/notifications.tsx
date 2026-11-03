import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/buttons';
import { Text } from '@/components/ui/text';
import { palette, shadow } from '@/constants/theme';
import { notifications } from '@/data/mock';
import { cn } from '@/lib/cn';

const toneStyle = {
  red: { bg: 'bg-alert-pink', color: palette.red },
  yellow: { bg: 'bg-yellow-100', color: '#B47A05' },
  green: { bg: 'bg-action-green', color: palette.green },
  purple: { bg: 'bg-[#F3EDFF]', color: palette.purple },
  blue: { bg: 'bg-action-blue', color: palette.blue },
} as const;

const iconMap = {
  alert: 'alert-circle-outline',
  chat: 'chatbubble-ellipses-outline',
  heart: 'heart-outline',
  shield: 'shield-checkmark-outline',
} as const;

export default function NotificationsScreen() {
  const [readIds, setReadIds] = useState<string[]>([]);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <StatusBar style="dark" />
      <View className="flex-row items-center px-5 pt-1">
        <BackButton onPress={() => router.back()} />
        <Text weight="semibold" className="ml-2 flex-1 text-[19px] text-navy">
          Notifications
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mark all notifications as read"
          hitSlop={8}
          onPress={() => setReadIds(notifications.map((item) => item.id))}>
          <Text weight="medium" className="text-[9.5px] text-brand-blue">
            Mark all read
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        <Text weight="medium" className="mb-2.5 text-[10px] text-muted">
          Today
        </Text>
        <View className="gap-2.5">
          {notifications.map((item) => {
            const read = readIds.includes(item.id);
            const tone = toneStyle[item.tone];
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                onPress={() =>
                  setReadIds((current) =>
                    current.includes(item.id) ? current : [...current, item.id]
                  )
                }
                className={cn(
                  'flex-row rounded-2xl border bg-white p-3.5 active:opacity-80',
                  read ? 'border-transparent' : 'border-yellow/40'
                )}
                style={shadow.card}>
                <View className={cn('h-10 w-10 items-center justify-center rounded-xl', tone.bg)}>
                  <Ionicons name={iconMap[item.icon]} size={19} color={tone.color} />
                </View>
                <View className="ml-3 flex-1">
                  <View className="flex-row items-center">
                    <Text weight="semibold" className="text-[11.5px] text-navy">
                      {item.title}
                    </Text>
                    {!read ? (
                      <View className="ml-2 h-1.5 w-1.5 rounded-full bg-brand-red" />
                    ) : null}
                    <Text className="ml-auto text-[8.5px] text-subtle">{item.time}</Text>
                  </View>
                  <Text className="mt-1 text-[10.5px] leading-4 text-muted">{item.body}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-6 rounded-2xl bg-[#EDF3FC] p-4">
          <Text weight="medium" className="text-[11px] text-navy">
            Stay in the loop
          </Text>
          <Text className="mt-1 text-[10px] leading-4 text-muted">
            We&apos;ll notify you about verified incidents, campus alerts, and updates to reports
            you follow.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
