import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Share, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton, PrimaryButton } from '@/components/ui/buttons';
import { Text } from '@/components/ui/text';
import { images } from '@/constants/images';
import { palette, shadow } from '@/constants/theme';
import { incidents, type MapIncident } from '@/data/mock';
import { cn } from '@/lib/cn';

const statusTone = (status: MapIncident['status']) => {
  if (status === 'Verified') {
    return 'bg-action-green text-brand-green';
  }
  if (status === 'Reported') {
    return 'bg-alert-pink text-brand-red';
  }
  return 'bg-yellow-100 text-[#B47A05]';
};

const categoryTone: Record<MapIncident['category'], string> = {
  Safety: 'bg-action-blue text-brand-blue',
  Incidents: 'bg-alert-pink text-brand-red',
  Events: 'bg-[#F3EDFF] text-brand-purple',
};

export default function IncidentScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const incidentId = typeof params.id === 'string' ? params.id : undefined;
  const incident = incidents.find((item) => item.id === incidentId) ?? incidents[0];

  if (!incident) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <View className="flex-row items-center px-5 pt-2">
          <BackButton onPress={() => router.back()} />
          <Text weight="semibold" className="ml-2 text-[19px] text-navy">
            Incident Details
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-7">
          <Text weight="semibold" className="text-[16px] text-navy">
            Incident unavailable
          </Text>
          <Text className="mt-2 text-center text-[11px] leading-5 text-muted">
            This incident could not be found in the design preview.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const tone = categoryTone[incident.category];
  const status = statusTone(incident.status);
  const related = incidents
    .filter((item) => item.id !== incident.id && item.category === incident.category)
    .slice(0, 2);
  const timeline = [
    {
      id: 'reported',
      description: 'Report submitted by a campus member.',
      time: incident.time,
    },
    {
      id: 'review',
      description:
        incident.status === 'Verified'
          ? 'Campus safety verified this report.'
          : 'Campus safety is reviewing this report.',
      time: 'Just now',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View className="flex-row items-center px-5 pt-2">
        <BackButton onPress={() => router.back()} />
        <Text weight="semibold" className="ml-2 flex-1 text-[19px] text-navy">
          Incident Details
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share incident"
          hitSlop={10}
          onPress={() =>
            Share.share({
              message: `${incident.title} · ${incident.location} · AlertU Campus Safety`,
            })
          }>
          <Ionicons name="share-social-outline" size={21} color={palette.navy} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        <View className="h-[170px] overflow-hidden rounded-2xl border border-line">
          <Image
            source={images.map}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          <View className="absolute inset-0 bg-white/10" />
          <View className="absolute left-3 top-3 flex-row items-center rounded-full bg-white/95 px-3 py-1.5">
            <View className="h-1.5 w-1.5 rounded-full bg-brand-red" />
            <Text weight="medium" className="ml-1.5 text-[8.5px] text-navy">
              Live alert
            </Text>
          </View>
          <View className="absolute left-[43%] top-[38%] items-center justify-center">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-red/15">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-red">
                <MaterialCommunityIcons name="map-marker" size={20} color="white" />
              </View>
            </View>
          </View>
          <View className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/95 px-3 py-2">
            <Text weight="medium" className="text-[9px] text-navy">
              {incident.location}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center gap-2">
          <View className={cn('rounded-full px-2.5 py-1', tone.split(' ')[0])}>
            <Text weight="medium" className={cn('text-[8.5px]', tone.split(' ')[1])}>
              {incident.category}
            </Text>
          </View>
          <View className={cn('rounded-full px-2.5 py-1', status.split(' ')[0])}>
            <Text weight="medium" className={cn('text-[8.5px]', status.split(' ')[1])}>
              {incident.status}
            </Text>
          </View>
        </View>

        <Text weight="semibold" className="mt-3 text-[18px] leading-6 text-navy">
          {incident.title}
        </Text>
        <View className="mt-2 flex-row items-center">
          <Ionicons name="location-outline" size={13} color={palette.muted} />
          <Text className="ml-1 text-[10px] text-muted">{incident.location}</Text>
          <View className="mx-2 h-1 w-1 rounded-full bg-[#CBD5E1]" />
          <Ionicons name="time-outline" size={13} color={palette.muted} />
          <Text className="ml-1 text-[10px] text-muted">{incident.time}</Text>
        </View>

        <Text weight="semibold" className="mb-2 mt-6 text-[12.5px] text-navy">
          Description
        </Text>
        <View className="rounded-2xl border border-line bg-white p-4" style={shadow.card}>
          <Text className="text-[11.5px] leading-[20px] text-[#5B6675]">
            {incident.description}
          </Text>
        </View>

        <Text weight="semibold" className="mb-2 mt-5 text-[12.5px] text-navy">
          Report details
        </Text>
        <View className="rounded-2xl border border-line bg-white px-4" style={shadow.card}>
          <View className="flex-row items-center border-b border-line py-3">
            <Text className="w-28 text-[10px] text-muted">Reported by</Text>
            <View className="h-6 w-6 items-center justify-center rounded-full bg-canvas">
              <Ionicons name="person-outline" size={12} color={palette.navy} />
            </View>
            <Text weight="medium" className="ml-2 text-[10.5px] text-navy">
              Identity protected
            </Text>
          </View>
          <View className="flex-row items-center border-b border-line py-3">
            <Text className="w-28 text-[10px] text-muted">First reported</Text>
            <Text weight="medium" className="text-[10.5px] text-navy">
              {incident.time}
            </Text>
          </View>
          <View className="flex-row items-center border-b border-line py-3">
            <Text className="w-28 text-[10px] text-muted">Reports</Text>
            <Text weight="medium" className="text-[10.5px] text-navy">
              {incident.status === 'Verified' ? 4 : 2}
            </Text>
          </View>
          <View className="flex-row items-center py-3">
            <Text className="w-28 text-[10px] text-muted">Verification</Text>
            <MaterialCommunityIcons
              name={incident.status === 'Verified' ? 'shield-check' : 'shield-outline'}
              size={14}
              color={incident.status === 'Verified' ? palette.green : palette.muted}
            />
            <Text weight="medium" className="ml-1.5 text-[10.5px] text-navy">
              {incident.status}
            </Text>
          </View>
        </View>

        <Text weight="semibold" className="mb-2 mt-5 text-[12.5px] text-navy">
          Timeline
        </Text>
        <View className="rounded-2xl border border-line bg-white px-4" style={shadow.card}>
          {timeline.map((entry, index) => (
            <View
              key={entry.id}
              className={cn(
                'flex-row py-3',
                index !== timeline.length - 1 && 'border-b border-line'
              )}>
              <View className="mr-3 mt-0.5 h-2 w-2 rounded-full bg-brand-blue" />
              <View className="flex-1">
                <Text weight="medium" className="text-[10.5px] leading-4 text-navy">
                  {entry.description}
                </Text>
                <Text className="mt-1 text-[8.5px] text-subtle">{entry.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {related.length > 0 ? (
          <>
            <View className="mb-2 mt-5 flex-row items-center justify-between">
              <Text weight="semibold" className="text-[12.5px] text-navy">
                Related Reports
              </Text>
            </View>
            <View className="gap-2">
              {related.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    router.push({ pathname: '/incident', params: { id: item.id } })
                  }
                  className="flex-row items-center rounded-2xl border border-line bg-white p-3 active:opacity-70">
                  <View className="h-8 w-8 items-center justify-center rounded-lg bg-alert-pink">
                    <Ionicons name="alert-circle-outline" size={16} color={palette.red} />
                  </View>
                  <View className="ml-2.5 flex-1">
                    <Text weight="medium" numberOfLines={1} className="text-[10.5px] text-navy">
                      {item.shortTitle}
                    </Text>
                    <Text className="mt-0.5 text-[8.5px] text-muted">
                      {item.location} · {item.time}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color="#C3CCD8" />
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        <PrimaryButton
          label="View on Map"
          variant="yellow"
          className="mt-6"
          icon="map-outline"
          onPress={() =>
            router.replace({ pathname: '/map', params: { id: incident.id } })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
