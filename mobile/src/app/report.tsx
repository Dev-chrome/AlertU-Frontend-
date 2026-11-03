import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton, PrimaryButton } from '@/components/ui/buttons';
import { Text } from '@/components/ui/text';
import { images } from '@/constants/images';
import { palette, shadow } from '@/constants/theme';
import { incidents } from '@/data/mock';
import { cn } from '@/lib/cn';

const steps = ['Details', 'Location', 'Review'];

const categories = [
  {
    label: 'Safety',
    icon: 'shield-checkmark-outline' as const,
    bg: 'bg-yellow-50',
    text: 'text-navy',
    color: palette.navy,
  },
  {
    label: 'Harassment',
    icon: 'alert-circle-outline' as const,
    bg: 'bg-[#F3EDFF]',
    text: 'text-brand-purple',
    color: palette.purple,
  },
  {
    label: 'Theft',
    icon: 'alert-outline' as const,
    bg: 'bg-alert-pink',
    text: 'text-brand-red',
    color: palette.red,
  },
  {
    label: 'Vandalism',
    icon: 'construct-outline' as const,
    bg: 'bg-[#E8F7F0]',
    text: 'text-brand-green',
    color: palette.green,
  },
  {
    label: 'Other',
    icon: 'ellipsis-horizontal' as const,
    bg: 'bg-[#F2F5F9]',
    text: 'text-muted',
    color: palette.muted,
  },
];

const locations = [
  'University Library',
  'Main Hall',
  'Hostel Block C',
  'Cafeteria',
  'Sports Grounds',
  'Main Gate',
];

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel="Report anonymously"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      className={cn(
        'h-7 w-12 flex-row items-center rounded-full px-[3px]',
        value ? 'bg-navy' : 'bg-[#DCE3ED]'
      )}>
      <View
        className={cn('h-[22px] w-[22px] rounded-full bg-yellow', value && 'ml-auto')}
        style={shadow.card}
      />
    </Pressable>
  );
}

export default function ReportScreen() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('Safety');
  const [description, setDescription] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [location, setLocation] = useState(locations[0]);
  const [error, setError] = useState('');
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<{
    id: string;
    incidentId: string;
  } | null>(null);

  const handleBack = () => {
    if (step > 0) {
      setStep((current) => current - 1);
      setError('');
      return;
    }
    router.back();
  };

  const pickPhotos = () => {
    Alert.alert(
      'Design preview',
      'Photo attachments are disabled in this design preview.'
    );
  };

  const submitReport = () => {
    if (!location) {
      setError('Please choose a campus location.');
      return;
    }

    setError('');
    setSubmittedReport({
      id: 'DEMO01',
      incidentId: incidents[0]?.id ?? 'suspicious',
    });
  };

  const next = () => {
    if (step === 0) {
      if (description.trim().length < 5) {
        setError('Please add a little more detail (at least 5 characters).');
        return;
      }
      setError('');
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!location) {
        setError('Please choose a location.');
        return;
      }
      setError('');
      setStep(2);
      return;
    }
    submitReport();
  };

  if (submittedReport) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-7">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-[#E8F7F0]">
            <Ionicons name="checkmark-circle" size={62} color={palette.green} />
          </View>
          <Text weight="semibold" className="mt-6 text-[23px] text-navy">
            Report Submitted
          </Text>
          <Text className="mt-2 max-w-[300px] text-center text-[12.5px] leading-[21px] text-muted">
            Thank you for speaking up. Campus security will review your report and keep you
            updated.
          </Text>
          <View className="mt-4 rounded-full bg-canvas px-4 py-2">
            <Text weight="medium" className="text-[10.5px] text-muted">
              Reference: AU-{submittedReport.id.slice(0, 8).toUpperCase()}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View the live incident"
            onPress={() =>
              router.replace({
                pathname: '/incident',
                params: { id: submittedReport.incidentId },
              })
            }
            className="mt-4 rounded-full bg-yellow px-5 py-2.5 active:opacity-70">
            <Text weight="semibold" className="text-[11px] text-navy">
              View live incident
            </Text>
          </Pressable>
        </View>
        <View className="px-6 pb-2">
          <PrimaryButton
            label="Back to Home"
            variant="navy"
            onPress={() => router.replace('/home')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-row items-center px-5 pt-2">
          <BackButton variant="circle" onPress={handleBack} />
          <Text weight="semibold" className="ml-4 text-[21px] tracking-[-0.2px] text-navy">
            Report Incident
          </Text>
        </View>

        <View className="mt-5 flex-row items-center px-5">
          {steps.map((label, index) => {
            const active = index === step;
            const complete = index < step;
            return (
              <View
                key={label}
                className={cn('flex-row items-center', index !== steps.length - 1 && 'flex-1')}>
                <View className="relative">
                  <View
                    className={cn(
                      'h-[22px] w-[22px] items-center justify-center rounded-full',
                      active || complete ? 'bg-navy' : 'bg-[#EEF2F7]'
                    )}>
                    {complete ? (
                      <Ionicons name="checkmark" size={12} color={palette.yellow} />
                    ) : (
                      <Text
                        weight="semibold"
                        className={cn(
                          'text-[10px]',
                          active ? 'text-yellow' : 'text-subtle'
                        )}>
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  {active ? (
                    <View className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-yellow" />
                  ) : null}
                </View>
                <Text
                  weight={active ? 'semibold' : 'medium'}
                  className={cn(
                    'ml-1 text-[9.5px]',
                    active || complete ? 'text-navy' : 'text-subtle'
                  )}>
                  {label}
                </Text>
                {index !== steps.length - 1 ? (
                  <View className="mx-1.5 flex-1 border-t border-dashed border-[#D6DFEA]" />
                ) : null}
              </View>
            );
          })}
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {step === 0 ? (
            <>
              <View className="flex-row flex-wrap gap-2.5">
                {categories.map((item) => {
                  const active = item.label === category;
                  return (
                    <Pressable
                      key={item.label}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => setCategory(item.label)}
                      className={cn(
                        'flex-row items-center rounded-full px-3.5 py-2.5 active:opacity-70',
                        active ? 'bg-yellow' : item.bg
                      )}>
                      <Ionicons
                        name={item.icon}
                        size={13}
                        color={active ? palette.navy : item.color}
                      />
                      <Text
                        weight="medium"
                        className={cn(
                          'ml-1.5 text-[11.5px]',
                          active ? 'text-navy' : item.text
                        )}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View className="mt-6">
                <Text weight="medium" className="text-[11.5px] text-muted">
                  Description <Text className="text-brand-red">*</Text>
                </Text>
                <View
                  className={cn(
                    'mt-2 rounded-2xl border bg-white',
                    error ? 'border-brand-red' : descriptionFocused ? 'border-brand-blue' : 'border-line'
                  )}>
                  <TextInput
                    multiline
                    value={description}
                    maxLength={4000}
                    onChangeText={(value) => {
                      setDescription(value);
                      if (error) setError('');
                    }}
                    onFocus={() => setDescriptionFocused(true)}
                    onBlur={() => setDescriptionFocused(false)}
                    placeholder="What happened? Be as detailed as possible..."
                    placeholderTextColor={palette.subtle}
                    textAlignVertical="top"
                    selectionColor={palette.blue}
                    className="min-h-[124px] px-3.5 py-3 font-sans text-[12px] leading-[19px] text-ink"
                  />
                </View>
                {error ? (
                  <Text className="mt-1.5 text-[10.5px] text-brand-red">{error}</Text>
                ) : null}
              </View>

              <View className="mt-5">
                <Text weight="medium" className="text-[11.5px] text-muted">
                  Add Photos <Text className="text-subtle">(optional)</Text>
                </Text>
                <View className="mt-2.5 flex-row gap-2.5">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Add photos"
                    onPress={pickPhotos}
                    className="h-[82px] w-[84px] items-center justify-center rounded-xl border border-dashed border-[#D6DFEA] bg-[#F8FAFD] active:opacity-70">
                    <Ionicons name="camera-outline" size={22} color={palette.navy} />
                    <Text className="mt-1 text-[8px] text-muted">Add photo</Text>
                  </Pressable>
                </View>
                <Text className="mt-2 text-[9px] leading-4 text-subtle">
                  Photo attachments are disabled in this design preview.
                </Text>
              </View>

              <View className="mt-6 flex-row items-center border-t border-line pt-4">
                <View className="flex-1 pr-4">
                  <Text weight="semibold" className="text-[12px] text-navy">
                    Report Anonymously
                  </Text>
                  <Text className="mt-1 text-[10px] leading-4 text-muted">
                    Your identity will be hidden from others.
                  </Text>
                </View>
                <Toggle value={anonymous} onChange={setAnonymous} />
              </View>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Text weight="semibold" className="text-[15px] text-navy">
                Where did it happen?
              </Text>
              <Text className="mt-1 text-[11px] leading-5 text-muted">
                Select the closest campus location so security can respond faster.
              </Text>

              <View className="mt-4 h-[150px] overflow-hidden rounded-2xl border border-line">
                <Image
                  source={images.map}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
                <View className="absolute inset-0 bg-white/10" />
                <View className="absolute left-[30%] top-[34%]">
                  <MaterialCommunityIcons name="map-marker" size={26} color={palette.red} />
                </View>
                <View className="absolute left-[66%] top-[56%]">
                  <MaterialCommunityIcons name="map-marker" size={22} color={palette.blue} />
                </View>
                <View className="absolute left-[46%] top-[66%] h-5 w-5 items-center justify-center rounded-full bg-brand-blue/20">
                  <View className="h-3 w-3 rounded-full border-2 border-white bg-brand-blue" />
                </View>
                <View
                  className="absolute bottom-2.5 left-2.5 flex-row items-center rounded-full bg-white px-3 py-2"
                  style={shadow.card}>
                  <MaterialCommunityIcons
                    name="crosshairs-gps"
                    size={14}
                    color={palette.navy}
                  />
                  <Text weight="medium" className="ml-1.5 text-[9px] text-navy">
                    Choose a campus location below
                  </Text>
                </View>
              </View>

              <Text weight="medium" className="mb-2 mt-6 text-[11.5px] text-muted">
                Select location <Text className="text-brand-red">*</Text>
              </Text>
              <View className="gap-2">
                {locations.map((item) => {
                  const active = item === location;
                  return (
                    <Pressable
                      key={item}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => setLocation(item)}
                      className={cn(
                        'h-[46px] flex-row items-center rounded-xl border px-3.5',
                        active ? 'border-yellow bg-yellow-50' : 'border-line bg-white'
                      )}>
                      <MaterialCommunityIcons
                        name="map-marker-outline"
                        size={17}
                        color={active ? palette.navy : palette.muted}
                      />
                      <Text
                        weight={active ? 'medium' : 'regular'}
                        className={cn('ml-2 text-[11.5px]', active ? 'text-navy' : 'text-muted')}>
                        {item}
                      </Text>
                      <View
                        className={cn(
                          'ml-auto h-[18px] w-[18px] items-center justify-center rounded-full border',
                          active ? 'border-navy bg-navy' : 'border-[#D5DEE9]'
                        )}>
                        {active ? (
                          <Ionicons name="checkmark" size={11} color={palette.yellow} />
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              {error ? (
                <Text className="mt-2 text-[10.5px] text-brand-red">{error}</Text>
              ) : null}
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Text weight="semibold" className="text-[15px] text-navy">
                Review your report
              </Text>
              <Text className="mt-1 text-[11px] leading-5 text-muted">
                Make sure everything looks right before sending it to campus security.
              </Text>

              <View className="mt-4 rounded-2xl border border-line bg-white p-4" style={shadow.card}>
                <View className="flex-row items-center">
                  <Text className="w-24 text-[10.5px] text-muted">Category</Text>
                  <View className="rounded-full bg-yellow px-3 py-1">
                    <Text weight="medium" className="text-[10px] text-navy">
                      {category}
                    </Text>
                  </View>
                </View>
                <View className="mt-3 flex-row items-center">
                  <Text className="w-24 text-[10.5px] text-muted">Location</Text>
                  <Text weight="medium" className="text-[11px] text-navy">
                    {location}
                  </Text>
                </View>
                <View className="mt-3 flex-row items-center">
                  <Text className="w-24 text-[10.5px] text-muted">Anonymous</Text>
                  <Text weight="medium" className="text-[11px] text-navy">
                    {anonymous ? 'Yes, hide my identity' : 'No, show my identity'}
                  </Text>
                </View>
                <View className="mt-3">
                  <Text className="text-[10.5px] text-muted">Description</Text>
                  <Text className="mt-1.5 text-[11.5px] leading-5 text-navy">{description}</Text>
                </View>
                <View className="mt-3">
                  <Text className="text-[10.5px] text-muted">Photos</Text>
                  <Text className="mt-1.5 text-[9px] text-subtle">No photos attached.</Text>
                </View>
              </View>

              <View className="mt-4 flex-row rounded-2xl bg-[#EDF3FC] p-3">
                <MaterialCommunityIcons
                  name="shield-check"
                  size={18}
                  color={palette.navy}
                  style={{ marginTop: 1 }}
                />
                <Text className="ml-2 flex-1 text-[10px] leading-4 text-navy/75">
                  Your report is shared only with the campus safety team. False reports may
                  be subject to review.
                </Text>
              </View>

              {error ? (
                <Text className="mt-3 text-[10.5px] leading-4 text-brand-red">{error}</Text>
              ) : null}
            </>
          ) : null}
        </ScrollView>

        <View className="border-t border-line bg-white px-5 pb-2 pt-3">
          <PrimaryButton
            label={step === 2 ? 'Submit Report' : 'Next'}
            variant="yellow"
            onPress={next}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
