import { useState, type ReactNode } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { cn } from '@/lib/cn';
import { palette } from '@/constants/theme';

import { Text } from './text';

type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  right?: ReactNode;
  containerClassName?: string;
  inputClassName?: string;
};

export function AuthField({
  label,
  error,
  hint,
  right,
  containerClassName,
  inputClassName,
  onFocus,
  onBlur,
  ...inputProps
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className={cn('w-full', containerClassName)}>
      <Text weight="semibold" className="mb-2 text-[12.5px] text-navy">
        {label}
      </Text>
      <View
        className={cn(
          'h-[52px] flex-row items-center rounded-xl border bg-white px-4',
          error
            ? 'border-brand-red'
            : focused
              ? 'border-brand-blue'
              : 'border-line'
        )}>
        <TextInput
          className={cn(
            'flex-1 py-0 font-sans text-[13px] text-ink outline-none',
            inputClassName
          )}
          placeholderTextColor={palette.subtle}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...inputProps}
        />
        {right}
      </View>
      {error ? (
        <Text className="mt-1.5 text-[10.5px] leading-4 text-brand-red">{error}</Text>
      ) : hint ? (
        <Text className="mt-1.5 text-[10.5px] leading-4 text-muted">{hint}</Text>
      ) : null}
    </View>
  );
}

type PasswordFieldProps = Omit<AuthFieldProps, 'right' | 'secureTextEntry'>;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthField
      {...props}
      secureTextEntry={!visible}
      right={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          accessibilityHint="Toggles whether your password is visible"
          accessibilityState={{ selected: visible }}
          hitSlop={8}
          onPress={() => setVisible((current) => !current)}
          className="-mr-1.5 ml-2 h-9 w-9 items-center justify-center rounded-full active:bg-canvas">
          <Ionicons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={19}
            color={visible ? palette.navy : palette.subtle}
          />
        </Pressable>
      }
    />
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onPress: () => void;
  error?: string;
};

export function SelectField({ label, value, onPress, error }: SelectFieldProps) {
  return (
    <View className="w-full">
      <Text weight="semibold" className="mb-2 text-[12.5px] text-navy">
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
        onPress={onPress}
        className={cn(
          'h-[52px] flex-row items-center justify-between rounded-xl border bg-white px-4 active:opacity-70',
          error ? 'border-brand-red' : 'border-line'
        )}>
        <Text className="text-[13px] text-ink">{value}</Text>
        <Ionicons name="chevron-down" size={16} color={palette.navy} />
      </Pressable>
      {error ? (
        <Text className="mt-1.5 text-[10.5px] text-brand-red">{error}</Text>
      ) : null}
    </View>
  );
}
