import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { palette, shadow } from '@/constants/theme';

const tabConfig = {
  home: { label: 'Home', active: 'home', inactive: 'home-outline' },
  map: { label: 'Map', active: 'map', inactive: 'map-outline' },
  pulse: { label: 'Pulse', active: 'chatbubbles', inactive: 'chatbubbles-outline' },
  news: { label: 'News', active: 'newspaper', inactive: 'newspaper-outline' },
  profile: { label: 'Profile', active: 'person', inactive: 'person-outline' },
} as const;

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-t border-line bg-white"
      style={[shadow.nav, { paddingBottom: Math.max(insets.bottom, 8), paddingTop: 8 }]}>
      <View className="flex-row px-2">
        {state.routes.map((route, index) => {
          const config = tabConfig[route.name as keyof typeof tabConfig];
          if (!config) {
            return null;
          }
          const focused = state.index === index;
          const iconName = focused ? config.active : config.inactive;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={`${config.label} tab`}
              onPress={onPress}
              onLongPress={onLongPress}
              className="flex-1 items-center justify-center py-1 active:opacity-70">
              <Ionicons
                name={iconName}
                size={22}
                color={focused ? palette.yellow : '#9AA5B4'}
              />
              <Text
                weight={focused ? 'semibold' : 'medium'}
                className="mt-1 text-[9px]"
                style={{ color: focused ? palette.yellow : '#9AA5B4' }}>
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
