import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { palette } from '@/constants/theme';

import { BackButton } from './buttons';
import { Text } from './text';

export function AuthHeader() {
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/onboarding');
  };

  return (
    <View className="flex-row items-center justify-between">
      <BackButton onPress={goBack} />
      <View className="flex-row items-center">
        <View className="h-6 w-6 items-center justify-center rounded-full bg-navy">
          <Ionicons name="shield-checkmark" size={12} color={palette.yellow} />
        </View>
        <Text weight="extrabold" className="ml-2 text-[15px] tracking-[-0.4px] text-navy">
          Alert
          <Text weight="extrabold" className="text-yellow">
            U
          </Text>
        </Text>
      </View>
    </View>
  );
}
