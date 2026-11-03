# Android push notifications (FCM)

AlertU uses **Firebase Cloud Messaging (FCM)** directly for Android push. The mobile app uses `expo-notifications` only as the client wrapper; the token sent to the backend is the native FCM registration token.

## Credential layout

| File | Location | Purpose |
| --- | --- | --- |
| `google-services.json` | `mobile/` | Android app registration for the Firebase project. Referenced by `expo.android.googleServicesFile` in `app.json`. |
| `firebase-service-account.json` | `backend/secrets/` | Firebase Admin SDK credential used by the backend to send FCM messages. Never put this in the mobile app. |

The backend reads the service account through `GOOGLE_APPLICATION_CREDENTIALS` (or `FIREBASE_SERVICE_ACCOUNT_JSON`) and requires `FIREBASE_PROJECT_ID` to match the project in `google-services.json`.

## Backend

Relevant pieces:

- `config/firebase.js` initializes Firebase Admin lazily.
- `push.service.js` sends FCM messages through `sendEachForMulticast`.
- `middleware/authenticate.js` accepts either a Firebase ID token or the development `dev:<token>` bearer token.
- `POST /devices/push-token` stores the FCM token for the authenticated user.
- `GET /devices` lists the caller's active devices.
- `DELETE /devices/push-token` deactivates a token.

Required values in `backend/.env`:

```dotenv
FIREBASE_PROJECT_ID=alertu-a7a43
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/backend/secrets/firebase-service-account.json
PUSH_ENABLED=true
PUSH_PROVIDER=fcm
```

For local Expo testing, the development-auth values must match `mobile/.env.local`:

```dotenv
DEV_AUTH_ENABLED=true
DEV_AUTH_TOKEN=<same token as the mobile app, without the dev: prefix>
```

## Mobile

`expo-notifications` is installed and configured in `app.json`. The app:

1. Creates the Android channel `alertu-alerts`.
2. Requests notification permission.
3. Calls `Notifications.getDevicePushTokenAsync()` to obtain the FCM token.
4. Registers that token with `POST /devices/push-token` using the development bearer token.
5. Refreshes the backend registration if FCM rotates the token.

The API URL defaults to:

| Target | URL |
| --- | --- |
| Android emulator | `http://10.0.2.2:5000` |
| iOS simulator / web | `http://localhost:5000` |
| Physical Android phone | `EXPO_PUBLIC_API_URL=http://<computer-LAN-IP>:5000` |

## Build and test

Remote push on Android requires a **development build**, not Expo Go.

Local build:

```bash
cd mobile
npx expo run:android
```

EAS cloud build (no local JDK required):

```bash
cd mobile
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build --profile development --platform android
```

When the app starts, the Metro log prints the registered FCM token in development. Test delivery from the backend:

```bash
cd backend
npm run push:test -- <FCM_TOKEN> "AlertU test" "FCM delivery works"
```

If the command returns a message ID, FCM accepted the message. If it returns `messaging/invalid-argument`, the token is invalid/expired; reinstall the app or restart it to obtain a fresh token.

## Troubleshooting

- `Firebase is not configured`: check `FIREBASE_PROJECT_ID` and `GOOGLE_APPLICATION_CREDENTIALS`, and confirm the service-account file exists.
- `messaging/authentication-error` or `messaging/third-party-auth-error`: the backend service account does not belong to the same Firebase project as the Android app.
- No token in the app log: confirm the app is a development build, Google Play services are available, and `google-services.json` is present at the mobile project root.
- `NETWORK_ERROR` from the app: the phone cannot reach the backend. Use the computer's LAN IP and make sure both devices are on the same network, or use a tunnel.
- Notifications arrive in the tray but tapping does nothing: the backend sends `data.deepLink` values such as `alertu://incident?id=...`; the root layout handles those links.
