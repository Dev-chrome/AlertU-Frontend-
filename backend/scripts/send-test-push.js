'use strict';

require('dotenv').config();

const { getMessaging, isFirebaseConfigured } = require('../config/firebase');

let token = process.argv[2];
const title = process.argv[3] || 'AlertU test notification';
const body = process.argv[4] || 'FCM is connected to your Android app.';
const deepLink = process.argv[5] || 'alertu://incident?id=test-notification';

const isPlaceholder = (value) =>
  value === 'FCM_TOKEN' ||
  /^<.*>$/.test(value) ||
  value.includes('...') ||
  value.startsWith('dA1b2c3');

const latestActiveToken = async () => {
  const { DeviceToken, sequelize } = require('../models');
  try {
    const device = await DeviceToken.findOne({
      where: { active: true },
      order: [['updatedAt', 'DESC']],
    });

    if (!device) {
      console.error(
        'No active FCM token is registered yet. Install the development build, sign in with Google, and allow notifications first.'
      );
      return null;
    }

    console.log(
      `Using the most recent active token (${device.platform}): ${device.token.slice(0, 12)}…${device.token.slice(-6)}`
    );
    return device.token;
  } finally {
    await sequelize.close();
  }
};

const run = async () => {
  if (!token) {
    console.error(
      'Usage: npm run push:test -- <FCM_DEVICE_TOKEN> ["Title"] ["Body"] ["alertu://incident?id=..."]'
    );
    console.error(
      'Or send to the most recently registered device: npm run push:test:latest -- ["Title"] ["Body"]'
    );
    console.error(
      'The Android app logs the FCM token in development after it registers with the backend.'
    );
    process.exitCode = 1;
    return;
  }

  if (token === '--latest') {
    token = await latestActiveToken();
    if (!token) {
      process.exitCode = 1;
      return;
    }
  }

  if (isPlaceholder(token)) {
    console.error(
      'That is the example placeholder, not a real FCM token. Use the full token printed by the app after Google sign-in on a development build.'
    );
    console.error(
      'Example: npm run push:test -- "fM...:APA91b..." "AlertU test" "FCM delivery works"'
    );
    process.exitCode = 1;
    return;
  }

  if (token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[')) {
    console.error(
      'That is an Expo push token. This project is configured for direct FCM; use the token printed by getDevicePushTokenAsync().'
    );
    process.exitCode = 1;
    return;
  }

  if (!isFirebaseConfigured()) {
    console.error(
      'Firebase is not configured. Check FIREBASE_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON.'
    );
    process.exitCode = 1;
    return;
  }

  const messageId = await getMessaging().send({
    token,
    notification: { title, body },
    data: { type: 'test', deepLink },
    android: {
      priority: 'high',
      notification: {
        channelId: 'alertu-alerts',
        sound: 'default',
      },
    },
  });

  console.log(`FCM accepted the test message: ${messageId}`);
};

run().catch((error) => {
  console.error('FCM test failed:', error.code || error.message);
  if (error.errorInfo) {
    console.error(JSON.stringify(error.errorInfo, null, 2));
  }
  process.exitCode = 1;
});
