# AI App Builder - API

Nuxt 3 backend API for the AI App Builder. Handles AI code generation, project management, and preview rendering.

## Features

- **AI Code Generation**: Generate React Native code using OpenRouter, Anthropic, or OpenAI
- **Project Management**: CRUD operations for user projects
- **Live Preview**: Server-rendered preview pages
- **ZIP Export**: Download complete React Native projects
- **Firebase Integration**: Authentication and Firestore database

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project (or use emulators)
- AI API key (OpenRouter, Anthropic, or OpenAI)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd app-builder-api
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Run development server:
```bash
npm run dev
```

### Development with Emulators

For local development without credentials:

```bash
# Uses Firebase emulators + mock AI
npm run dev:emulator
```

## Environment Variables

See `.env.example` for all required environment variables.

## API Endpoints

All endpoints require Firebase Auth token: `Authorization: Bearer {token}`

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Chat & Generation
- `POST /api/chat/generate` - Generate code via AI

### Preview
- `GET /preview/:projectId` - Render project preview

### Export
- `POST /api/export/:id` - Generate ZIP download

### Health
- `GET /api/health` - API health check

## Project Structure

```
server/
├── api/
│   ├── auth/         # Token verification
│   ├── projects/     # Project CRUD
│   ├── chat/         # AI generation
│   ├── preview/      # Preview data
│   └── export/       # ZIP generation
├── middleware/
│   └── auth.ts       # Firebase auth middleware
└── utils/
    ├── firebase.ts   # Firebase Admin SDK
    └── ai.ts         # AI providers (OpenRouter, Anthropic, OpenAI)

pages/
└── preview/
    └── [projectId].vue  # Preview rendering
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Run AI tests with OpenRouter
npm run test:ai
```

**Test Coverage**: 19 tests (API + AI + utilities)

## AI Providers

The API supports multiple AI providers with automatic fallback:

1. **OpenRouter** (if `OPENROUTER_API_KEY` set)
   - Access to 300+ models
   - Free models available for testing
   - Recommended: `xiaomi/mimo-v2-flash:free`

2. **Anthropic** (if `ANTHROPIC_API_KEY` set)
   - Best code quality
   - Recommended: `claude-3-5-sonnet-20241022`

3. **OpenAI** (if `OPENAI_API_KEY` set)
   - Recommended: `gpt-4o`

4. **Mock** (no API key needed)
   - Returns template code for development

## Deployment

### Vercel

1. Import repository to Vercel
2. Add environment variables
3. Deploy

The project is pre-configured for Vercel with `nitro.preset: 'vercel'`.

## Related

- [React Native Client](../app-builder-rn) - Mobile app

## License

MIT
