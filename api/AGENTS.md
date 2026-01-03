# AI App Builder - Project Summary

## Overview
This is a **Nuxt 3** full-stack application that enables users to build React Native/Expo mobile apps using AI-powered code generation. Users describe what they want to build in natural language, and the AI agent generates the complete mobile app code in real-time.

---

## Architecture

### Technology Stack
- **Frontend**: Vue 3 + Nuxt 3
- **Backend**: Nitro (Nuxt server)
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication (session cookies)
- **AI**: Multiple providers - Anthropic Claude, OpenAI, OpenRouter, Azure OpenAI
- **Code Execution**: E2B sandboxes for Droid agent execution
- **Preview**: Expo Snack SDK for live React Native previews
- **Deployment**: Vercel

---

## Frontend Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `pages/index.vue` | Landing page with hero section and features |
| `/login` | `pages/login.vue` | User login |
| `/register` | `pages/register.vue` | User registration |
| `/forgot-password` | `pages/forgot-password.vue` | Password recovery |
| `/home` | `pages/home.vue` | Dashboard showing recent projects, create project modal |
| `/chat` | `pages/chat.vue` | **Main chat interface** - AI conversation + live preview panel |
| `/preview/[projectId]` | `pages/preview/[projectId].vue` | Standalone project preview |
| `/preview/embedded/[projectId]` | `pages/preview/embedded/[projectId].vue` | Embeddable preview iframe |

---

## API Routes

### Authentication (`/api/auth/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/sessionLogin` | POST | Create session cookie from Firebase ID token |
| `/auth/sessionLogout` | POST | Clear session cookie |
| `/auth/verify` | POST | Verify Firebase token |

### Projects CRUD (`/api/projects/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/projects` | GET | List all user's projects |
| `/projects/create` | POST | Create new project |
| `/projects/[id]` | GET | Get single project |
| `/projects/[id]` | PUT | Update project |
| `/projects/[id]` | DELETE | Delete project |

### AI Generation (`/api/chat/`)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat/generate` | POST | **Core AI endpoint** - Unified agent with SSE streaming |
| `/chat/generate-droid` | POST | Alternative using Factory Droid in E2B sandbox |

### Preview & Export
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/preview/[projectId]` | GET | Get project files for preview |
| `/preview/snack/[projectId]` | GET | Get/create Expo Snack session |
| `/preview/snack/[projectId]` | DELETE | Delete Snack session |
| `/runtime/[projectId]` | GET | Get runtime configuration |
| `/export/[id]` | POST | Generate downloadable ZIP of project |

### External Integrations
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/expo/snack/[snackId]` | GET | Proxy to Expo Snack API |
| `/snackager/[...path]` | GET | Proxy for Snack package bundler |
| `/health` | GET | Health check |

---

## Server Architecture

### Agent System (`/server/agent/`)
A sophisticated, modular AI agent architecture:

```
server/agent/
├── index.ts           # Main exports (runAgent, presets, tools)
├── core/
│   ├── agent.ts       # Streaming agent runner using Vercel AI SDK
│   ├── types.ts       # TypeScript definitions
│   └── prompt-builder.ts  # System prompt construction
├── tools/
│   ├── file/          # Read, Create, Edit, LS, Grep tools
│   ├── planning/      # Task planning tools
│   └── validation/    # Code validation tools
├── middleware/
│   ├── logging.ts     # Agent logging
│   ├── file-tracking.ts   # Track file changes
│   └── rate-limiting.ts   # Rate limiting
└── presets/           # Pre-configured agent setups (default, minimal, full)
```

**Key Features:**
- **Tool-based execution**: Agent can Read, Create, Edit files, List directories, Search with Grep
- **SSE streaming**: Real-time updates for tool calls, text generation, file changes
- **Multi-turn context**: Preserves conversation history with tool call results
- **Configurable presets**: `default`, `minimal`, `full`, `command`

### Virtual File System (`/server/utils/virtualFS.ts`)
In-memory file system for managing project files:
- File CRUD operations
- Patch/diff-based editing
- Dependency management (via package.json)
- Search/grep functionality
- History with rollback support
- Command execution (`ls`, `cat`, `find`, etc.)

### AI Model Providers (`/server/utils/providers.ts`)
Supports multiple AI providers with automatic fallback:
1. **OpenRouter** (300+ models, free options)
2. **Anthropic** (Claude)
3. **OpenAI** (GPT-4)
4. **Azure OpenAI** (for Droid integration)

---

## Frontend Composables (`/composables/`)

| Composable | Purpose |
|------------|---------|
| `useBuilder` | Main chat/generation logic - SSE handling, message management, streaming state |
| `useProjects` | Project CRUD operations |
| `useAuthState` | Global auth state management |
| `useApi` | API client with authentication headers |

---

## Components (`/components/`)

### Chat Components
- `ChatMessage.vue` - Renders user/assistant messages with tool call visualization
- `ChatInput.vue` - Input field with submit/cancel
- `WelcomePanel.vue` - Initial suggestions when no messages

### Preview Components
- `PreviewPanel.vue` - Expo Snack preview iframe
- `IPhoneFrame.vue` - iPhone device frame for preview

### Common Components
- `AppButton.vue`, `AppTextField.vue`, `ProjectCard.vue`

### Home Components
- `HomeHeader.vue`, `QuickActions.vue`, `CreateProjectModal.vue`

---

## Data Flow

1. **User creates project** → Stored in Firestore with empty code
2. **User sends message** → `/api/chat/generate` endpoint
3. **Agent processes** → Streams SSE events (tool calls, text, file changes)
4. **Files generated** → Saved to Firestore as JSON
5. **Preview renders** → Uses Expo Snack SDK to show live preview
6. **Export** → Generates ZIP with package.json, babel.config, etc.

---

## Environment Variables

```env
# Firebase Admin
FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY

# Firebase Client (public)
NUXT_PUBLIC_FIREBASE_API_KEY, NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NUXT_PUBLIC_FIREBASE_PROJECT_ID

# AI Models
ANTHROPIC_API_KEY, OPENAI_API_KEY, OPENROUTER_API_KEY
DEFAULT_AI_MODEL

# E2B (for Droid)
E2B_API_KEY, E2B_TEMPLATE_ID

# Azure (for Droid BYOK)
AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_MODEL
FACTORY_API_KEY

# Development
USE_FIREBASE_EMULATOR
```

---

## Testing

- Uses **Vitest** for unit testing
- Tests in `/test/` directory
- Commands: `npm test`, `npm run test:watch`
