import { Pressable, useWindowDimensions, View } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './text';

type Variant = 'underline' | 'soft' | 'navy';

type SegmentedTabsProps = {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  variant?: Variant;
  className?: string;
};

export function SegmentedTabs({
  items,
  value,
  onChange,
  variant = 'soft',
  className,
}: SegmentedTabsProps) {
  const { width } = useWindowDimensions();
  const compact = width < 375;

  if (variant === 'underline') {
    return (
      <View className={cn('flex-row border-b border-line', className)}>
        {items.map((item) => {
          const active = item === value;
          return (
            <Pressable
              key={item}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(item)}
              className="relative h-12 flex-1 items-center justify-center active:opacity-70">
              <Text
                numberOfLines={1}
                weight={active ? 'semibold' : 'medium'}
                className={cn(compact ? 'text-[11.5px]' : 'text-[12.5px]', active ? 'text-navy' : 'text-muted')}>
                {item}
              </Text>
              {active ? (
                <View className="absolute bottom-0 h-[3px] w-11 rounded-full bg-yellow" />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    );
  }

  if (variant === 'navy') {
    return (
      <View className={cn('flex-row items-center justify-between', className)}>
        {items.map((item) => {
          const active = item === value;
          return (
            <Pressable
              key={item}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(item)}
              className={cn(
                'h-9 items-center justify-center rounded-xl active:opacity-70',
                compact ? 'px-2' : 'px-4',
                active ? 'bg-navy' : 'bg-transparent'
              )}>
              <Text
                numberOfLines={1}
                weight={active ? 'semibold' : 'medium'}
                className={cn(
                  compact ? 'text-[11.5px]' : 'text-[12px]',
                  active ? 'text-yellow' : 'text-navy/70'
                )}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View className={cn('flex-row items-center justify-between', className)}>
      {items.map((item) => {
        const active = item === value;
        return (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(item)}
            className={cn(
              'h-9 items-center justify-center rounded-full active:opacity-70',
              compact ? 'px-2' : 'px-4',
              active ? 'bg-yellow' : 'bg-transparent'
            )}>
            <Text
              numberOfLines={1}
              weight={active ? 'semibold' : 'medium'}
              className={cn(
                compact ? 'text-[10.5px]' : 'text-[12px]',
                active ? 'text-navy' : 'text-muted'
              )}>
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
