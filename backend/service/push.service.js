'use strict';

const env = require('../config/env');
const logger = require('../config/logger');
const { getMessaging, isFirebaseConfigured } = require('../config/firebase');
const AppError = require('../util/AppError');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const FCM_BATCH_SIZE = 500;
const EXPO_BATCH_SIZE = 100;

const isExpoToken = (token) => token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[');

const chunks = (items, size) => {
  const result = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
};

const normaliseData = (data = {}) =>
  Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key, value]) => [key, typeof value === 'string' ? value : String(value)])
  );

const invalidFcmCode = (code) =>
  [
    'messaging/registration-token-not-registered',
    'messaging/invalid-registration-token',
    'messaging/invalid-argument',
  ].includes(code);

const invalidExpoCode = (code) =>
  ['DeviceNotRegistered', 'InvalidCredentials', 'MessageTooBig'].includes(code);

const createPushService = ({
  messagingProvider = getMessaging,
  fetchImpl = global.fetch,
  config = env,
  log = logger,
  firebaseConfigured = isFirebaseConfigured,
} = {}) => {
  const sendFcm = async (tokens, notification) => {
    if (!firebaseConfigured()) {
      throw AppError.serviceUnavailable(
        'Firebase Cloud Messaging is not configured on this server',
        'PUSH_NOT_CONFIGURED'
      );
    }

    const messaging = messagingProvider();
    const result = { delivered: 0, failed: 0, invalidTokens: [], errors: [] };

    for (const batch of chunks(tokens, FCM_BATCH_SIZE)) {
      const response = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: normaliseData(notification.data),
        android: {
          priority: 'high',
          notification: { channelId: 'alertu-alerts', sound: 'default' },
        },
        apns: {
          payload: { aps: { sound: 'default' } },
        },
      });

      response.responses.forEach((item, index) => {
        if (item.success) {
          result.delivered += 1;
          return;
        }
        result.failed += 1;
        const code = item.error?.code || 'messaging/unknown-error';
        if (invalidFcmCode(code)) result.invalidTokens.push(batch[index]);
        result.errors.push({ token: batch[index], code, message: item.error?.message || code });
      });
    }

    return result;
  };

  const sendExpo = async (tokens, notification) => {
    const result = { delivered: 0, failed: 0, invalidTokens: [], errors: [] };

    for (const batch of chunks(tokens, EXPO_BATCH_SIZE)) {
      const response = await fetchImpl(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(config.EXPO_ACCESS_TOKEN
            ? { Authorization: `Bearer ${config.EXPO_ACCESS_TOKEN}` }
            : {}),
        },
        body: JSON.stringify(
          batch.map((token) => ({
            to: token,
            title: notification.title,
            body: notification.body,
            data: normaliseData(notification.data),
            sound: 'default',
            priority: 'high',
            channelId: 'alertu-alerts',
          }))
        ),
      });

      if (!response.ok) {
        const message = `Expo Push returned HTTP ${response.status}`;
        log.warn({ status: response.status }, 'expo push request failed');
        batch.forEach((token) =>
          result.errors.push({ token, code: 'EXPO_HTTP_ERROR', message })
        );
        result.failed += batch.length;
        continue;
      }

      const payload = await response.json();
      const tickets = Array.isArray(payload.data) ? payload.data : [];

      batch.forEach((token, index) => {
        const ticket = tickets[index];
        if (ticket?.status === 'ok') {
          result.delivered += 1;
          return;
        }
        result.failed += 1;
        const code = ticket?.details?.error || 'EXPO_UNKNOWN_ERROR';
        if (invalidExpoCode(code)) result.invalidTokens.push(token);
        result.errors.push({
          token,
          code,
          message: ticket?.message || code,
        });
      });
    }

    return result;
  };

  const sendToTokens = async (rawTokens, notification) => {
    const tokens = [...new Set((rawTokens || []).filter((token) => typeof token === 'string' && token.length > 0))];
    if (tokens.length === 0) {
      return { delivered: 0, failed: 0, invalidTokens: [], errors: [] };
    }

    const provider = config.PUSH_PROVIDER;
    let fcmTokens = [];
    let expoTokens = [];

    if (provider === 'expo') {
      expoTokens = tokens;
    } else if (provider === 'auto') {
      expoTokens = tokens.filter(isExpoToken);
      fcmTokens = tokens.filter((token) => !isExpoToken(token));
    } else {
      fcmTokens = tokens.filter((token) => !isExpoToken(token));
      const rejected = tokens.filter(isExpoToken);
      const rejectedResult = {
        delivered: 0,
        failed: rejected.length,
        invalidTokens: [],
        errors: rejected.map((token) => ({
          token,
          code: 'WRONG_PUSH_PROVIDER',
          message: 'Expo token received but PUSH_PROVIDER is fcm',
        })),
      };
      const result =
        fcmTokens.length === 0
          ? { delivered: 0, failed: 0, invalidTokens: [], errors: [] }
          : await sendFcm(fcmTokens, notification);
      return {
        delivered: result.delivered,
        failed: result.failed + rejectedResult.failed,
        invalidTokens: result.invalidTokens,
        errors: [...result.errors, ...rejectedResult.errors],
      };
    }

    const [fcmResult, expoResult] = await Promise.all([
      fcmTokens.length > 0
        ? sendFcm(fcmTokens, notification)
        : { delivered: 0, failed: 0, invalidTokens: [], errors: [] },
      expoTokens.length > 0
        ? sendExpo(expoTokens, notification)
        : { delivered: 0, failed: 0, invalidTokens: [], errors: [] },
    ]);

    return {
      delivered: fcmResult.delivered + expoResult.delivered,
      failed: fcmResult.failed + expoResult.failed,
      invalidTokens: [...fcmResult.invalidTokens, ...expoResult.invalidTokens],
      errors: [...fcmResult.errors, ...expoResult.errors],
    };
  };

  return {
    sendToTokens,
    sendFcm,
    sendExpo,
    isExpoToken,
  };
};

module.exports = {
  createPushService,
  pushService: createPushService(),
  isExpoToken,
};
