import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/avatar';
import { BackButton } from '@/components/ui/buttons';
import { Text } from '@/components/ui/text';
import { palette, shadow } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { avatarForName } from '@/lib/adapters';

type MenuItem = {
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  color: string;
  route?: '/report' | '/notifications';
};

const menuItems: MenuItem[] = [
  {
    label: 'Submit a Report',
    subtitle: 'Report a safety concern',
    icon: 'document-text-outline' as const,
    bg: 'bg-action-blue',
    color: palette.blue,
    route: '/report' as const,
  },
  {
    label: 'Saved Posts',
    subtitle: 'Not available yet',
    icon: 'bookmark-outline' as const,
    bg: 'bg-[#F3EDFF]',
    color: palette.purple,
  },
  {
    label: 'Notifications',
    subtitle: 'Campus safety updates',
    icon: 'notifications-outline' as const,
    bg: 'bg-yellow-100',
    color: '#B47A05',
    route: '/notifications' as const,
  },
  {
    label: 'Settings',
    subtitle: 'Coming soon',
    icon: 'settings-outline' as const,
    bg: 'bg-[#EEF2F7]',
    color: palette.navy,
  },
  {
    label: 'Help & Support',
    subtitle: 'Contact campus safety',
    icon: 'help-circle-outline' as const,
    bg: 'bg-[#E8F7F0]',
    color: palette.green,
  },
];

const stats = [
  { label: 'Reports', value: '4' },
  { label: 'Posts', value: '12' },
  { label: 'Member since', value: '2025' },
];

export default function ProfileScreen() {
  const { user, avatarUri, setAvatarUri, signOut } = useAuth();
  const [picking, setPicking] = useState(false);
  const displayName = user?.name || 'AlertU member';
  const role = user?.role || 'Student';
  const email = user?.email || '';
  const accountStatus = user?.accountStatus || 'active';
  const avatarSource = avatarUri ? { uri: avatarUri } : avatarForName(displayName);

  const pickProfilePhoto = async () => {
    if (picking) return;

    setPicking(true);
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            'Photo access needed',
            'Allow AlertU to access your photos so you can add a profile picture.'
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Could not update photo', 'Please try again.');
    } finally {
      setPicking(false);
    }
  };

  const logout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out of AlertU?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          void signOut().finally(() => router.replace('/login'));
        },
      },
    ]);
  };

  const openMenu = (label: string, route?: '/report' | '/notifications') => {
    if (route) {
      router.push(route);
      return;
    }
    if (label === 'Saved Posts') {
      Alert.alert('Saved Posts', 'Saved posts will be available in a future update.');
      return;
    }
    if (label === 'Help & Support') {
      Alert.alert(
        'Help & Support',
        'For immediate danger, contact campus security. For app issues, reach your campus safety office through the report form.'
      );
      return;
    }
    Alert.alert(label, `${label} will be available soon.`);
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <StatusBar style="dark" />
      <View className="flex-row items-center px-5 pt-1">
        <BackButton onPress={() => router.push('/home')} />
        <Text weight="semibold" className="ml-2 flex-1 text-[19px] text-navy">
          Profile
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          hitSlop={10}
          onPress={() =>
            Alert.alert('Settings', 'Account, alert and privacy settings are coming soon.')
          }>
          <Ionicons name="settings-outline" size={21} color={palette.navy} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 92 }}
        showsVerticalScrollIndicator={false}>
        <View className="items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            disabled={picking}
            onPress={pickProfilePhoto}
            className="items-center active:opacity-80">
            <View className="rounded-full border-[3px] border-white" style={shadow.float}>
              <Avatar source={avatarSource} size={88} />
              <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-yellow">
                <Ionicons name="camera" size={15} color={palette.navy} />
              </View>
            </View>
            <Text weight="medium" className="mt-2 text-[10px] text-brand-blue">
              {picking
                ? 'Opening photos…'
                : avatarUri
                  ? 'Change profile photo'
                  : 'Add profile photo'}
            </Text>
          </Pressable>
          <Text weight="semibold" className="mt-3 text-[20px] text-navy">
            {displayName}
          </Text>
          <Text className="mt-1 text-[11px] text-muted">{role}</Text>
          {email ? (
            <Text className="mt-0.5 text-[10px] text-subtle">{email}</Text>
          ) : null}
          <View className="mt-2.5 flex-row items-center rounded-full bg-[#E8F7F0] px-3 py-1.5">
            <MaterialCommunityIcons name="shield-check" size={13} color={palette.green} />
            <Text weight="medium" className="ml-1.5 text-[9.5px] text-brand-green">
              {accountStatus === 'active'
                ? 'Verified campus member'
                : 'Campus member'}
            </Text>
          </View>
        </View>

        <View
          className="mt-6 flex-row justify-between rounded-2xl border border-white bg-white px-2 py-4"
          style={shadow.card}>
          {stats.map((stat, index) => (
            <View key={stat.label} className="flex-1 items-center">
              <Text weight="semibold" className="text-[17px] text-navy">
                {stat.value}
              </Text>
              <Text className="mt-0.5 text-[9.5px] text-muted">{stat.label}</Text>
              {index !== stats.length - 1 ? (
                <View className="absolute right-0 top-1 h-8 w-px bg-line" />
              ) : null}
            </View>
          ))}
        </View>

        <View className="mt-6 gap-2">
          {menuItems.map((item) => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => openMenu(item.label, item.route)}
              className="flex-row items-center rounded-2xl border border-white bg-white px-3.5 py-3 active:opacity-80"
              style={shadow.card}>
              <View className={`h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}>
                <Ionicons name={item.icon} size={19} color={item.color} />
              </View>
              <View className="ml-3 flex-1">
                <Text weight="medium" className="text-[12.5px] text-navy">
                  {item.label}
                </Text>
                <Text className="mt-0.5 text-[9.5px] text-muted">{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#C3CCD8" />
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log out"
          onPress={logout}
          className="mt-5 flex-row items-center justify-center rounded-2xl border border-alert-pink bg-white py-3.5 active:opacity-70">
          <Ionicons name="log-out-outline" size={18} color={palette.red} />
          <Text weight="semibold" className="ml-2 text-[12px] text-brand-red">
            Log Out
          </Text>
        </Pressable>

        <Text className="mt-5 text-center text-[9px] text-subtle">
          AlertU Campus Safety · v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
