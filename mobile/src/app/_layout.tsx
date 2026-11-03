import '@/global.css';

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/poppins';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';

import { AuthProvider, useAuth } from '@/context/auth';
import {
  addPushTokenRefreshListener,
  configureNotifications,
  registerForPushNotificationsAsync,
} from '@/lib/push';

SplashScreen.preventAutoHideAsync();
configureNotifications();

function PushBootstrap() {
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (Platform.OS === 'web' || !userId) return;

    registerForPushNotificationsAsync().catch((error) => {
      console.warn('[push] Registration failed:', error);
    });

    const tokenRefreshSubscription = addPushTokenRefreshListener();

    return () => {
      tokenRefreshSubscription?.remove();
    };
  }, [userId]);

  return null;
}

function handleNotificationResponse(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data;
  const deepLink = typeof data?.deepLink === 'string' ? data.deepLink : null;

  if (!deepLink?.startsWith('alertu://')) return;

  if (deepLink.startsWith('alertu://incident')) {
    const id = deepLink.split('id=')[1]?.split('&')[0];
    if (id) {
      router.push({ pathname: '/incident', params: { id } });
    }
    return;
  }

  if (deepLink.startsWith('alertu://post')) {
    router.push('/pulse');
  }
}

function AppStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F6F9FD' },
      }}>
      <Stack.Screen name="index" options={{ animation: 'fade' }} />
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      <Stack.Screen name="signup" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen
        name="report"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="incident"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="comments"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="notifications"
        options={{ animation: 'slide_from_right' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const receivedSubscription = Notifications.addNotificationReceivedListener(
      () => {}
    );
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );
    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) {
      handleNotificationResponse(lastResponse);
    }

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <PushBootstrap />
      <View className="flex-1 items-center bg-[#E9F0F9]">
        <View className="h-full w-full max-w-[520px] flex-1 overflow-hidden bg-canvas">
          <StatusBar style="dark" />
          <AppStack />
        </View>
      </View>
    </AuthProvider>
  );
}
