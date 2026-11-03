import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NewsArt, PulseArt, ReportArt } from '@/components/onboarding-art';
import { PrimaryButton } from '@/components/ui/buttons';
import { Text } from '@/components/ui/text';
import { images } from '@/constants/images';
import { palette, shadow } from '@/constants/theme';

const TOTAL_SLIDES = 4;

const featureRows = [
  {
    label: 'Report incidents',
    icon: 'home' as const,
    iconColor: '#EA7D44',
    iconBg: 'bg-[#FDF0E6]',
  },
  {
    label: 'View on map',
    icon: 'location' as const,
    iconColor: palette.blue,
    iconBg: 'bg-[#EAF2FE]',
  },
  {
    label: 'Get verified updates',
    icon: 'shield-checkmark' as const,
    iconColor: palette.navy,
    iconBg: 'bg-[#EDF2FA]',
  },
];

function Dots({ active, light = false }: { active: number; light?: boolean }) {
  return (
    <View className="flex-row items-center gap-1.5">
      {Array.from({ length: TOTAL_SLIDES }).map((_, index) => (
        <View
          key={index}
          className="rounded-full"
          style={{
            width: index === active ? 20 : 6,
            height: index === active ? 7 : 6,
            backgroundColor:
              index === active
                ? light
                  ? '#FFFFFF'
                  : palette.navy
                : light
                  ? 'rgba(255,255,255,0.28)'
                  : '#D6DFEB',
          }}
        />
      ))}
    </View>
  );
}

function NextButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Next"
      onPress={onPress}
      className="h-[54px] w-[54px] items-center justify-center rounded-full bg-navy active:opacity-80"
      style={shadow.float}>
      <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
    </Pressable>
  );
}

function SlideFooter({
  active,
  onNext,
}: {
  active: number;
  onNext: () => void;
}) {
  return (
    <View className="min-h-[54px] flex-row items-center justify-end">
      <View pointerEvents="none" className="absolute inset-x-0 items-center">
        <Dots active={active} />
      </View>
      <NextButton onPress={onNext} />
    </View>
  );
}

type SlideProps = {
  width: number;
  height: number;
  insets: { top: number; bottom: number };
  goNext: () => void;
  goBack: () => void;
};

function IntroSlide({ width, height, insets, goNext }: SlideProps) {
  const heroHeight = Math.min(width * 0.99, height * 0.44, 440);
  const waveHeight = Math.max(56, Math.min(92, heroHeight * 0.2));

  return (
    <View style={{ width, height }} className="bg-white">
      <View style={{ height: heroHeight }} className="overflow-hidden bg-[#EAF0F7]">
        <Image
          source={images.heroCampus}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          accessibilityLabel="Students walking on campus"
        />
        <LinearGradient
          colors={['rgba(11,31,58,0.12)', 'rgba(11,31,58,0)', 'rgba(255,255,255,0)']}
          style={StyleSheet.absoluteFill}
        />
        <Image
          source={images.onboardingWave}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -1,
            width: '100%',
            height: waveHeight,
          }}
          contentFit="fill"
        />
      </View>

      <View
        className="flex-1 px-6"
        style={{ paddingTop: 18, paddingBottom: insets.bottom + 20 }}>
        <Text weight="semibold" className="text-[27px] leading-[38px] tracking-[-0.4px] text-navy">
          Stay Informed.{'\n'}Stay Safe.
        </Text>
        <Text className="mt-3 max-w-[300px] text-[13px] leading-[24px] text-[#64748B]">
          {'Get real-time alerts, report incidents,\nexplore campus, and stay connected\nwith your campus community.'}
        </Text>

        <View className="mt-auto">
          <SlideFooter active={0} onNext={goNext} />
        </View>
      </View>
    </View>
  );
}

function InfoSlide({
  index,
  width,
  height,
  insets,
  goNext,
  goBack,
}: SlideProps & { index: 1 | 2 | 3 }) {
  const content = {
    1: {
      title: 'Report Incidents',
      subtitle: 'See something? Say something.\nHelp keep your campus safe.',
      art: <ReportArt width={Math.min(width * 0.68, height * 0.3, 290)} />,
    },
    2: {
      title: 'Campus Pulse',
      subtitle: 'Real reports. Verified updates.\nBetter decisions.',
      art: <PulseArt width={Math.min(width * 0.8, height * 0.32, 320)} />,
    },
    3: {
      title: 'Gist News',
      subtitle:
        'News, events, trends and\nstudent gist \u2014 all in one place.',
      art: <NewsArt width={Math.min(width * 0.8, height * 0.32, 320)} />,
    },
  }[index];

  return (
    <View
      style={{ width, height, paddingTop: insets.top + 6, paddingBottom: insets.bottom + 16 }}
      className="bg-white">
      <View className="px-6">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous slide"
          hitSlop={12}
          onPress={goBack}
          className="h-9 w-9 items-start justify-center active:opacity-60">
          <Ionicons name="chevron-back" size={24} color={palette.navy} />
        </Pressable>

        <Text
          weight="semibold"
          className="mt-2 text-[27px] leading-[35px] tracking-[-0.4px] text-navy">
          {content.title}
        </Text>
        <Text className="mt-2 text-[13px] leading-[22px] text-[#64748B]">
          {content.subtitle}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 8,
        }}
        showsVerticalScrollIndicator={false}>
        {content.art}

        {index === 1 ? (
          <View className="mt-3 w-full gap-2">
            {featureRows.map((row) => (
              <View
                key={row.label}
                className="flex-row items-center rounded-2xl border border-line bg-white px-3.5 py-2.5"
                style={shadow.card}>
                <View className={`h-8 w-8 items-center justify-center rounded-full ${row.iconBg}`}>
                  <Ionicons name={row.icon} size={16} color={row.iconColor} />
                </View>
                <Text weight="medium" className="ml-3 text-[11.5px] text-navy">
                  {row.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={13}
                  color="#C6CFDB"
                  style={{ marginLeft: 'auto' }}
                />
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View className="px-6">
        {index === 3 ? (
          <PrimaryButton label="Get Started" variant="navy" onPress={() => router.push('/login')} />
        ) : (
          <SlideFooter active={index} onNext={goNext} />
        )}
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [pageWidth, setPageWidth] = useState(Math.min(window.width, 520));
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<number>>(null);

  const goTo = (next: number) => {
    if (next < 0) {
      return;
    }
    if (next >= TOTAL_SLIDES) {
      router.push('/login');
      return;
    }
    listRef.current?.scrollToOffset({ offset: pageWidth * next, animated: true });
    setIndex(next);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!pageWidth) {
      return;
    }
    const next = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    if (next !== index && next >= 0 && next < TOTAL_SLIDES) {
      setIndex(next);
    }
  };

  return (
    <View
      className="flex-1 bg-white"
      onLayout={(event) => {
        const measured = Math.round(event.nativeEvent.layout.width);
        if (measured > 0 && measured !== pageWidth) {
          setPageWidth(measured);
        }
      }}>
      <StatusBar style="dark" />
      <FlatList
        ref={listRef}
        data={[0, 1, 2, 3]}
        keyExtractor={(item) => String(item)}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        getItemLayout={(_, itemIndex) => ({
          length: pageWidth,
          offset: pageWidth * itemIndex,
          index: itemIndex,
        })}
        renderItem={({ item }) =>
          item === 0 ? (
            <IntroSlide
              width={pageWidth}
              height={window.height}
              insets={insets}
              goNext={() => goTo(item + 1)}
              goBack={() => goTo(item - 1)}
            />
          ) : (
            <InfoSlide
              index={item as 1 | 2 | 3}
              width={pageWidth}
              height={window.height}
              insets={insets}
              goNext={() => goTo(item + 1)}
              goBack={() => goTo(item - 1)}
            />
          )
        }
      />
    </View>
  );
}
