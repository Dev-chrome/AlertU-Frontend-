import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View } from 'react-native';

import { images } from '@/constants/images';
import { palette, shadow } from '@/constants/theme';
import { cn } from '@/lib/cn';

import { Text } from './ui/text';

const blobClass = 'absolute rounded-full bg-[#EFF5FD]';

export function ReportArt({ width = 280 }: { width?: number }) {
  const height = width * 0.82;
  return (
    <View style={{ width, height }} className="items-center justify-center">
      <View className={blobClass} style={{ width: width * 0.9, height: width * 0.9 }} />
      <View
        className="absolute rounded-[28px] border border-[#E8F0FA] bg-[#F7FAFE]"
        style={{ width: width * 0.5, height: height * 0.32, left: width * 0.02, top: height * 0.2, transform: [{ rotate: '-10deg' }] }}
      />
      <View
        className="absolute rounded-[24px] border border-[#E8F0FA] bg-white"
        style={{ width: width * 0.42, height: height * 0.28, right: width * 0.01, top: height * 0.15, transform: [{ rotate: '8deg' }] }}
      />
      <View
        className="absolute rounded-2xl bg-white px-3 py-2"
        style={[
          shadow.card,
          { left: width * 0.02, bottom: height * 0.13, transform: [{ rotate: '-6deg' }] },
        ]}>
        <Text className="text-[8px] text-muted">Incident reported</Text>
        <View className="mt-1.5 h-1.5 w-16 rounded-full bg-[#E8EEF7]" />
        <View className="mt-1 h-1.5 w-10 rounded-full bg-[#EEF2F8]" />
      </View>
      <Ionicons name="shield" size={width * 0.56} color={palette.navy} />
      <View
        className="absolute items-center justify-center rounded-full bg-white"
        style={[{ width: width * 0.2, height: width * 0.2 }, shadow.float]}>
        <MaterialCommunityIcons name="map-marker" size={width * 0.115} color={palette.yellow} />
      </View>
      <View
        className="absolute items-center justify-center rounded-full bg-white"
        style={[
          shadow.card,
          { width: width * 0.12, height: width * 0.12, right: width * 0.11, top: height * 0.25 },
        ]}>
        <Ionicons name="checkmark" size={width * 0.06} color={palette.green} />
      </View>
      <View
        className="absolute"
        style={{ left: width * 0.08, top: height * 0.06 }}>
        <Ionicons name="sparkles" size={18} color={palette.yellow} />
      </View>
    </View>
  );
}

const statusRows = [
  {
    label: 'Reported',
    icon: 'alert-circle-outline' as const,
    iconBg: 'bg-[#E8F0FD]',
    iconColor: palette.navy,
    bg: 'bg-[#F1F6FE]',
    text: 'text-navy',
  },
  {
    label: 'Under Review',
    icon: 'time-outline' as const,
    iconBg: 'bg-[#FFF0C9]',
    iconColor: '#B47A05',
    bg: 'bg-[#FFF8E6]',
    text: 'text-[#B47A05]',
  },
  {
    label: 'Verified',
    icon: 'checkmark-circle-outline' as const,
    iconBg: 'bg-[#DDF6EA]',
    iconColor: palette.green,
    bg: 'bg-[#EDFBF4]',
    text: 'text-brand-green',
  },
];

export function PulseArt({ width = 290 }: { width?: number }) {
  const height = width * 0.82;
  return (
    <View style={{ width, height }} className="items-center justify-center">
      <View className={blobClass} style={{ width: width * 0.78, height: width * 0.78 }} />
      <View
        className="absolute rounded-[26px] border border-[#E8F0FA] bg-[#F8FBFF]"
        style={{
          width: width * 0.72,
          height: height * 0.58,
          top: height * 0.08,
          right: width * 0.02,
          transform: [{ rotate: '7deg' }],
        }}>
        <View className="ml-6 mt-6 h-2 w-20 rounded-full bg-[#E8EFF9]" />
        <View className="ml-6 mt-2.5 h-1.5 w-28 rounded-full bg-[#EFF4FA]" />
        <View className="ml-6 mt-2 h-1.5 w-24 rounded-full bg-[#EFF4FA]" />
        <View className="ml-6 mt-2 h-1.5 w-28 rounded-full bg-[#EFF4FA]" />
        <View className="ml-6 mt-2 h-1.5 w-16 rounded-full bg-[#EFF4FA]" />
      </View>
      <View
        className="absolute rounded-[26px] bg-white p-4"
        style={[
          shadow.float,
          {
            width: width * 0.73,
            height: height * 0.68,
            left: width * 0.04,
            top: height * 0.11,
            transform: [{ rotate: '-5deg' }],
          },
        ]}>
        <View className="mb-3 flex-row items-center">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-[#EDF3FC]">
            <Ionicons name="map" size={13} color={palette.navy} />
          </View>
          <View className="ml-2">
            <View className="h-1.5 w-16 rounded-full bg-[#E4EBF5]" />
            <View className="mt-1 h-1.5 w-10 rounded-full bg-[#F0F4F9]" />
          </View>
          <View className="ml-auto flex-row gap-1">
            <View className="h-1 w-1 rounded-full bg-[#D7E0EC]" />
            <View className="h-1 w-1 rounded-full bg-[#D7E0EC]" />
            <View className="h-1 w-1 rounded-full bg-[#D7E0EC]" />
          </View>
        </View>

        {statusRows.map((row) => (
          <View
            key={row.label}
            className={cn('mb-2 flex-row items-center rounded-xl px-2.5 py-2', row.bg)}>
            <View className={cn('h-6 w-6 items-center justify-center rounded-full', row.iconBg)}>
              <Ionicons name={row.icon} size={13} color={row.iconColor} />
            </View>
            <Text weight="medium" className={cn('ml-2 text-[9.5px]', row.text)}>
              {row.label}
            </Text>
            <View className="ml-auto h-1.5 w-8 rounded-full bg-white/90" />
          </View>
        ))}
      </View>
      <View
        className="absolute overflow-hidden rounded-2xl border border-[#EAF0F8] bg-white"
        style={[
          shadow.card,
          {
            width: width * 0.34,
            height: height * 0.31,
            right: width * 0.02,
            bottom: height * 0.02,
            transform: [{ rotate: '8deg' }],
          },
        ]}>
        <Image source={images.map} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        <View className="absolute left-3 top-4 h-4 w-4 items-center justify-center rounded-full bg-brand-red">
          <Ionicons name="location" size={9} color="white" />
        </View>
        <View className="absolute bottom-5 right-5 h-4 w-4 items-center justify-center rounded-full bg-brand-blue">
          <Ionicons name="location" size={9} color="white" />
        </View>
      </View>
    </View>
  );
}

export function NewsArt({ width = 290 }: { width?: number }) {
  const height = width * 0.84;
  return (
    <View style={{ width, height }} className="items-center justify-center">
      <View className={blobClass} style={{ width: width * 0.8, height: width * 0.8 }} />
      <View
        className="absolute rounded-[26px] border border-[#E8F0FA] bg-[#F8FBFF]"
        style={{
          width: width * 0.76,
          height: height * 0.66,
          top: height * 0.09,
          left: width * 0.14,
          transform: [{ rotate: '7deg' }],
        }}>
        <View className="ml-5 mt-5 h-2 w-24 rounded-full bg-[#E7EEF8]" />
        <View className="ml-5 mt-2 h-1.5 w-32 rounded-full bg-[#F0F4FA]" />
        <View className="ml-5 mt-1.5 h-1.5 w-24 rounded-full bg-[#F0F4FA]" />
        <View className="ml-5 mt-1.5 h-1.5 w-28 rounded-full bg-[#F0F4FA]" />
      </View>
      <View
        className="absolute rounded-[26px] bg-white p-3"
        style={[
          shadow.float,
          {
            width: width * 0.8,
            height: height * 0.7,
            left: width * 0.02,
            top: height * 0.1,
            transform: [{ rotate: '-5deg' }],
          },
        ]}>
        <View className="flex-row items-center">
          <View className="h-6 w-6 items-center justify-center rounded-full bg-navy">
            <MaterialCommunityIcons name="account" size={13} color="white" />
          </View>
          <View className="ml-2">
            <View className="h-1.5 w-16 rounded-full bg-[#DCE5F0]" />
            <View className="mt-1 h-1.5 w-10 rounded-full bg-[#EFF4FA]" />
          </View>
        </View>
        <Image
          source={images.heroCampus}
          style={{ width: '100%', height: height * 0.31, borderRadius: 12, marginTop: 9 }}
          contentFit="cover"
        />
        <View className="mt-2 h-1.5 w-32 rounded-full bg-[#E9EEF5]" />
        <View className="mt-1.5 h-1.5 w-24 rounded-full bg-[#F0F4FA]" />
        <View className="mt-auto flex-row items-center pt-1">
          <Ionicons name="heart" size={16} color={palette.red} />
          <View className="ml-1.5 h-1.5 w-6 rounded-full bg-[#E9EEF5]" />
          <Ionicons name="chatbubble-outline" size={14} color={palette.muted} style={{ marginLeft: 12 }} />
          <View className="ml-1.5 h-1.5 w-5 rounded-full bg-[#E9EEF5]" />
          <MaterialCommunityIcons
            name="fire"
            size={19}
            color={palette.orange}
            style={{ marginLeft: 'auto' }}
          />
        </View>
      </View>
      <View
        className="absolute"
        style={{ left: width * 0.02, top: height * 0.06 }}>
        <View className="h-5 w-1.5 rounded-full bg-yellow" style={{ transform: [{ rotate: '-35deg' }] }} />
        <View className="mt-1 ml-2 h-5 w-1.5 rounded-full bg-yellow/70" style={{ transform: [{ rotate: '-35deg' }] }} />
      </View>
    </View>
  );
}
