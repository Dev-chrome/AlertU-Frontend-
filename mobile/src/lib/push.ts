import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { api } from './api';

export const ALERT_CHANNEL_ID = 'alertu-alerts';

export function configureNotifications() {
  if (Platform.OS === 'web') return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const isAndroidDevelopmentBuild = () =>
  Platform.OS === 'android' &&
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

async function sendTokenToBackend(token: string) {
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  await api('/devices/push-token', {
    method: 'POST',
    body: {
      token,
      platform: 'android',
      appVersion,
    },
  });
}

export function addPushTokenRefreshListener() {
  if (!isAndroidDevelopmentBuild()) return null;

  return Notifications.addPushTokenListener((devicePushToken) => {
    const token = String(devicePushToken.data);
    sendTokenToBackend(token).catch((error) => {
      console.warn('[push] Could not refresh the FCM token with the backend:', error);
    });
  });
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS !== 'android') {
    return null;
  }

  if (!isAndroidDevelopmentBuild()) {
    console.warn(
      '[push] Remote push requires a development build. Expo Go on Android cannot register an FCM token.'
    );
    return null;
  }

  await Notifications.setNotificationChannelAsync(ALERT_CHANNEL_ID, {
    name: 'AlertU alerts',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#0B1F3A',
    sound: 'default',
  });

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;

  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== 'granted') {
    console.warn('[push] Notification permission was not granted.');
    return null;
  }

  const devicePushToken = await Notifications.getDevicePushTokenAsync();
  const token = String(devicePushToken.data);

  await sendTokenToBackend(token);

  if (__DEV__) {
    console.log('[push] Android FCM token registered with the backend:', token);
  }

  return token;
}
