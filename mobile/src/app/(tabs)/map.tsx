import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton, IconButton } from '@/components/ui/buttons';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { Text } from '@/components/ui/text';
import { images } from '@/constants/images';
import { palette, shadow } from '@/constants/theme';
import { incidents, type MapIncident } from '@/data/mock';

const categories = ['All', 'Safety', 'Incidents'];

const pinColors: Record<MapIncident['tone'], string> = {
  red: palette.red,
  yellow: palette.yellow,
  green: palette.green,
  navy: palette.navy,
  blue: palette.blue,
  purple: palette.purple,
};

function MapPin({
  incident,
  selected,
  onPress,
}: {
  incident: MapIncident;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={incident.title}
      onPress={onPress}
      hitSlop={8}
      style={[
        {
          position: 'absolute',
          top: incident.top as `${number}%`,
          left: incident.left as `${number}%`,
          zIndex: selected ? 20 : 10,
        },
      ]}>
      <View style={{ transform: [{ scale: selected ? 1.12 : 1 }] }}>
        <MaterialCommunityIcons
          name="map-marker"
          size={selected ? 34 : 27}
          color={pinColors[incident.tone]}
        />
        <View
          style={{
            position: 'absolute',
            top: selected ? 9 : 7,
            left: selected ? 13 : 10,
            width: selected ? 8 : 6,
            height: selected ? 8 : 6,
            borderRadius: 4,
            backgroundColor: 'white',
          }}
        />
      </View>
    </Pressable>
  );
}

export default function MapScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const [filter, setFilter] = useState('All');
  const [selectedId, setSelectedId] = useState<string | null>(
    params.id ?? incidents[0]?.id ?? null
  );

  const visibleIncidents =
    filter === 'All'
      ? incidents
      : incidents.filter((incident) => incident.category === filter);
  const selected =
    visibleIncidents.find((incident) => incident.id === selectedId) ??
    visibleIncidents[0] ??
    null;

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <StatusBar style="dark" />

      <View className="px-5">
        <View className="flex-row items-center">
          <BackButton onPress={() => {}} />
          <Text
            weight="semibold"
            numberOfLines={1}
            className="ml-2 flex-1 text-[16px] tracking-[-0.2px] text-navy">
            Campus Map &amp; Alerts
          </Text>
          <IconButton
            icon="notifications-outline"
            badge
            accessibilityLabel="Notifications"
            onPress={() => router.push('/notifications')}
          />
        </View>

        <SegmentedTabs
          items={categories}
          value={filter}
          onChange={(next) => {
            setFilter(next);
            const nextIncidents =
              next === 'All'
                ? incidents
                : incidents.filter((incident) => incident.category === next);
            setSelectedId(nextIncidents[0]?.id ?? null);
          }}
          variant="navy"
          className="mt-3"
        />
      </View>

      <View className="mt-3 flex-1 overflow-hidden bg-[#EFF3EC]">
        <Image
          source={images.map}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
          transition={250}
        />
        <View className="absolute inset-0 bg-white/10" />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refresh incidents"
          onPress={() => {
            setFilter('All');
            setSelectedId(incidents[0]?.id ?? null);
          }}
          className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-white active:opacity-70"
          style={shadow.card}>
          <MaterialCommunityIcons name="refresh" size={18} color={palette.navy} />
        </Pressable>

        {visibleIncidents.map((incident) => (
          <MapPin
            key={incident.id}
            incident={incident}
            selected={selected?.id === incident.id}
            onPress={() => setSelectedId(incident.id)}
          />
        ))}

        <View className="absolute left-[32%] top-[52%] items-center">
          <Text weight="semibold" className="text-[12px] text-navy" style={shadow.card}>
            University Library
          </Text>
          <View className="mt-2 h-7 w-7 items-center justify-center rounded-full bg-brand-blue/15">
            <View className="h-4 w-4 rounded-full border-2 border-white bg-brand-blue" />
          </View>
        </View>

        {selected ? (
          <View className="absolute left-3 top-[17%] w-[68%]" style={shadow.float}>
            <View className="rounded-2xl bg-white p-3">
              <View className="flex-row items-center">
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-alert-pink">
                  <MaterialCommunityIcons
                    name="map-marker-alert"
                    size={24}
                    color={palette.red}
                  />
                </View>
                <View className="ml-2.5 flex-1">
                  <Text weight="semibold" className="text-[11.5px] leading-4 text-navy">
                    {selected.shortTitle}
                  </Text>
                  <Text weight="medium" className="mt-0.5 text-[10px] text-brand-red">
                    {selected.location}
                  </Text>
                  <Text className="mt-0.5 text-[9px] text-muted">{selected.time}</Text>
                </View>
              </View>
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: -5,
                left: '42%',
                width: 12,
                height: 12,
                backgroundColor: 'white',
                transform: [{ rotate: '45deg' }],
              }}
            />
          </View>
        ) : null}

        <Text className="absolute left-2 top-[49%] text-[7px] text-[#78857A]">
          © OpenStreetMap contributors
        </Text>

        {selected ? (
          <View className="absolute bottom-3 left-3 right-3">
            <View className="rounded-2xl bg-white p-3" style={shadow.float}>
              <View className="flex-row items-center">
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-alert-pink">
                  <MaterialCommunityIcons
                    name="map-marker-alert"
                    size={24}
                    color={palette.red}
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text weight="semibold" className="text-[12px] leading-4 text-navy">
                    {selected.title}
                  </Text>
                  <Text weight="medium" className="mt-0.5 text-[10px] text-brand-red">
                    {selected.time}
                  </Text>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View incident details"
                onPress={() =>
                  router.push({ pathname: '/incident', params: { id: selected.id } })
                }
                className="mt-3 h-9 w-[54%] flex-row items-center justify-center self-center rounded-full bg-navy active:opacity-80">
                <Text weight="semibold" className="text-[10.5px] text-white">
                  View details
                </Text>
                <Ionicons name="chevron-forward" size={12} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
