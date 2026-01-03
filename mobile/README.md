# AI App Builder - React Native Client

React Native/Expo mobile app for AI-powered React Native app generation.

## Features

- **Cross-Platform**: iOS and Android support via Expo
- **Firebase Auth**: Email/password authentication
- **Real-Time Preview**: Embedded Snack runtime for live code preview
- **Project Management**: Create, edit, and delete projects
- **Dark Theme**: Modern dark UI design

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Firebase project with Authentication enabled
- iOS Simulator / Android Emulator or physical device

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd app-builder-rn
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your Firebase credentials
```

4. Start the development server:
```bash
npx expo start
```

## Environment Variables

See `.env.example` for all required Firebase configuration values. You'll need:

- Firebase API keys (iOS and Android)
- Firebase Auth Domain
- Firebase Project ID
- Firebase App IDs

Get these from your Firebase Console > Project Settings.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── builder/      # Builder screen components
│   ├── chat/         # Chat interface components
│   ├── common/       # Shared components
│   ├── home/         # Home screen components
│   └── preview/      # Preview panel components
├── config/           # App configuration
├── hooks/            # Custom React hooks
├── models/           # TypeScript types/models
├── providers/        # React context providers
├── runtime/          # Snack runtime integration
├── screens/          # App screens
└── services/         # API and auth services
```

## Running on Device

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

## Related

- [API Server](../app-builder-api) - Nuxt 3 backend

## License

MIT
