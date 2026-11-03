import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';
import { palette } from '@/constants/theme';

import { Text } from './text';

type BackButtonProps = {
  onPress?: () => void;
  variant?: 'plain' | 'circle';
  className?: string;
  color?: string;
  iconSize?: number;
};

export function BackButton({
  onPress,
  variant = 'plain',
  className,
  color = palette.navy,
  iconSize = 23,
}: BackButtonProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={12}
      onPress={handlePress}
      className={cn(
        'h-10 w-10 items-center justify-center active:opacity-60',
        variant === 'circle' &&
          'h-11 w-11 rounded-full border border-[#F8E9BB] bg-[#FFFBEB]'
      )}>
      <Ionicons name="arrow-back" size={iconSize} color={color} />
    </Pressable>
  );
}

type IconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  badge?: boolean;
  size?: number;
  color?: string;
  className?: string;
  accessibilityLabel: string;
};

export function IconButton({
  icon,
  onPress,
  badge,
  size = 22,
  color = palette.navy,
  className,
  accessibilityLabel,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      onPress={onPress}
      className={cn(
        'relative h-10 w-10 items-center justify-center active:opacity-60',
        className
      )}>
      <Ionicons name={icon} size={size} color={color} />
      {badge ? (
        <View className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-white bg-brand-red" />
      ) : null}
    </Pressable>
  );
}

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'navy' | 'yellow' | 'white' | 'outline';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'navy',
  className,
  disabled,
  loading,
  icon,
}: PrimaryButtonProps) {
  const isNavy = variant === 'navy';
  const isYellow = variant === 'yellow';
  const isWhite = variant === 'white';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      className={cn(
        'h-[52px] w-full flex-row items-center justify-center gap-2 rounded-full px-6 active:opacity-80',
        isNavy && 'bg-navy',
        isYellow && 'bg-yellow',
        isWhite && 'bg-white',
        variant === 'outline' && 'border border-line bg-white',
        (disabled || loading) && 'opacity-50',
        className
      )}>
      {loading ? (
        <ActivityIndicator color={isNavy ? '#FFFFFF' : palette.navy} />
      ) : (
        <>
          <Text
            weight="semibold"
            className={cn(
              'text-[14px]',
              isNavy && 'text-white',
              (isYellow || isWhite || variant === 'outline') && 'text-navy'
            )}>
            {label}
          </Text>
          {icon ? (
            <Ionicons
              name={icon}
              size={18}
              color={isNavy ? '#FFFFFF' : palette.navy}
            />
          ) : null}
        </>
      )}
    </Pressable>
  );
}
