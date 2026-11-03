import { Image } from 'expo-image';
import { View, type ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { cn } from '@/lib/cn';
import { palette } from '@/constants/theme';

type AvatarProps = {
  source: ImageSourcePropType;
  size?: number;
  verified?: boolean;
  online?: boolean;
  ring?: boolean;
  className?: string;
};

export function Avatar({
  source,
  size = 44,
  verified,
  online,
  ring,
  className,
}: AvatarProps) {
  const badgeSize = Math.max(14, Math.round(size * 0.34));

  return (
    <View className={cn('relative', className)} style={{ width: size, height: size }}>
      <Image
        source={source}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ring ? 2 : 0,
          borderColor: '#FFFFFF',
        }}
        contentFit="cover"
        transition={150}
      />
      {verified ? (
        <View
          className="absolute -bottom-0.5 -right-0.5 items-center justify-center rounded-full border-[1.5px] border-white bg-brand-blue"
          style={{ width: badgeSize, height: badgeSize }}>
          <Ionicons name="checkmark" size={badgeSize * 0.62} color="#FFFFFF" />
        </View>
      ) : online ? (
        <View
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white"
          style={{
            width: badgeSize,
            height: badgeSize,
            backgroundColor: palette.green,
          }}
        />
      ) : null}
    </View>
  );
}
