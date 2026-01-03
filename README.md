# AI App Builder

An AI-powered platform for generating React Native mobile applications through natural language conversations.

## Project Structure

```
app_builder/
├── api/          # Nuxt 3 backend API
└── mobile/       # React Native/Expo mobile client
```

## Components

### API (`/api`)

Nuxt 3 backend that handles:
- AI code generation (OpenAI, Anthropic, Azure)
- Firebase authentication & Firestore database
- Project management (CRUD)
- Live preview rendering
- ZIP export functionality

[See API README](./api/README.md)

### Mobile (`/mobile`)

React Native/Expo app featuring:
- Cross-platform support (iOS, Android)
- Firebase authentication
- Real-time code preview with Snack runtime
- Project management interface
- Dark theme UI

[See Mobile README](./mobile/README.md)

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Authentication enabled
- AI API key (OpenAI, Anthropic, or Azure)

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/app_builder.git
cd app_builder
```

2. **Set up the API:**
```bash
cd api
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

3. **Set up the Mobile app:**
```bash
cd mobile
npm install
cp .env.example .env
# Edit .env with your Firebase credentials
npx expo start
```

## License

MIT
