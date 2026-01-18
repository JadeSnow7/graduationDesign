# classPlatform (Expo Mini App)

A standalone Expo client for the course platform. It focuses on one clear feature set (login + AI chat) and demonstrates network + storage usage with local caching.

## Features
- Account login via `POST /api/v1/auth/login`
- AI chat via `POST /api/v1/ai/chat`
- Local storage of session + chat history (AsyncStorage)
- Performance-friendly UI (FlatList, cleanup on unmount)

## Quick Start

```bash
cd mini-app-expo
npm install
npm run ios
# or
npm run android
```

## Configure API

Update the backend base URL in `src/config.ts`:

```ts
export const API_BASE_URL = 'http://YOUR_BACKEND_IP:8080';
```

## Assignment Mapping
- Function: AI chat mini app
- Tech point: network requests + local storage
- Performance: FlatList rendering + request cancellation + cleanup

## Notes
- If you are testing on device, use your machine's LAN IP instead of `localhost`.
