# AI App Builder

An AI-powered platform for generating React Native mobile applications through natural language conversations.

## Project Structure

```
app_builder/
├── api/          # Nuxt 3 backend API
└── mobile/       # React Native/Expo mobile client
```

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Expo CLI** - Install with `npm install -g expo-cli`
- **iOS Simulator** (Mac) or **Android Emulator** - For mobile development
- **Firebase Project** - For authentication and database
- **AI API Key** - OpenRouter (recommended), Anthropic, or OpenAI

---

## Step 1: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project

2. **Enable Authentication:**
   - Navigate to **Build > Authentication**
   - Click **Get Started**
   - Enable **Email/Password** sign-in method

3. **Create Firestore Database:**
   - Navigate to **Build > Firestore Database**
   - Click **Create Database**
   - Start in **production mode** (we'll set rules later)

4. **Get Web App Credentials (for API):**
   - Go to **Project Settings** (gear icon)
   - Under **Your apps**, click the web icon (`</>`)
   - Register your app and copy:
     - `apiKey` → `NUXT_PUBLIC_FIREBASE_API_KEY`
     - `authDomain` → `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `projectId` → `NUXT_PUBLIC_FIREBASE_PROJECT_ID`

5. **Get Service Account (for API server):**
   - Go to **Project Settings > Service Accounts**
   - Click **Generate new private key**
   - From the downloaded JSON, copy:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `client_email` → `FIREBASE_CLIENT_EMAIL`
     - `private_key` → `FIREBASE_PRIVATE_KEY`

6. **Get Mobile App Credentials:**
   - In **Project Settings > Your apps**
   - Add an **iOS app** and an **Android app**
   - Copy the `apiKey` and `appId` for each platform

---

## Step 2: Get an AI API Key

Choose one of the following providers:

### Option A: OpenRouter (Recommended - Has Free Models)
1. Go to [OpenRouter](https://openrouter.ai/)
2. Create an account and go to **Keys**
3. Create a new API key
4. Set `OPENROUTER_API_KEY` in your `.env`
5. Use free models like `xiaomi/mimo-v2-flash:free`

### Option B: Anthropic
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Set `ANTHROPIC_API_KEY` in your `.env`

### Option C: OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an API key
3. Set `OPENAI_API_KEY` in your `.env`

---

## Step 3: Set Up the API Server

```bash
# Navigate to api directory
cd api

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

Edit `api/.env` with your credentials:

```bash
# Firebase Client (from Step 1.4)
NUXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Firebase Admin (from Step 1.5)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AI API Key (from Step 2 - at least one required)
OPENROUTER_API_KEY=sk-or-v1-...
# ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...

# Default AI model
DEFAULT_AI_MODEL=xiaomi/mimo-v2-flash:free
```

Start the API server:

```bash
npm run dev
```

The API will be running at `http://localhost:3000`

---

## Step 4: Set Up the Mobile App

```bash
# Navigate to mobile directory (from project root)
cd mobile

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

Edit `mobile/.env` with your Firebase credentials (from Step 1.6):

```bash
# Firebase Configuration
FIREBASE_IOS_API_KEY=AIzaSy...
FIREBASE_ANDROID_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_IOS_APP_ID=1:123456789:ios:abc123
FIREBASE_ANDROID_APP_ID=1:123456789:android:def456
```

Start the Expo development server:

```bash
npx expo start
```

Then:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan the QR code with Expo Go app on your phone

---

## Step 5: Test the App

1. **Register an account** in the mobile app
2. **Create a new project** from the home screen
3. **Describe what you want to build** in natural language
4. Watch the AI generate your React Native app!

---

## Development Notes

### API Configuration

The mobile app connects to `localhost:3000` by default. To change this, edit `mobile/src/config/api.ts`:

```typescript
export const ApiConfig = {
  useLocalBackend: true,  // Set to false for production
  productionBackendUrl: 'https://your-api.vercel.app',
  // ...
};
```

### Running on Physical Device

When testing on a physical device, you need to update the API URL since `localhost` won't work:

1. Find your computer's local IP (e.g., `192.168.1.100`)
2. Update `mobile/src/config/api.ts`:
   ```typescript
   get localBackendUrl(): string {
     return 'http://192.168.1.100:3000';
   }
   ```

### Firebase Emulators (Optional)

For local development without a Firebase project:

```bash
# In api directory
npm run dev:emulator
```

This uses Firebase emulators and mock AI responses.

---

## Deployment

### API (Vercel)

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Set the root directory to `api`
4. Add all environment variables
5. Deploy

### Mobile (Expo)

```bash
cd mobile
npx expo build:ios    # For iOS
npx expo build:android # For Android
```

Or use [EAS Build](https://docs.expo.dev/build/introduction/) for production builds.

---

## Troubleshooting

### "Not authenticated" error
- Make sure the API server is running (`npm run dev` in `/api`)
- Check that Firebase credentials are correct in both `.env` files

### "Invalid API key" error
- Verify your AI API key is correct
- For OpenRouter, make sure you have credits or are using a free model

### Mobile app can't connect to API
- Ensure API is running on port 3000
- For physical devices, use your computer's local IP instead of `localhost`
- Check that both devices are on the same network

---

## License

MIT
