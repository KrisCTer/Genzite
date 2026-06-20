# Frontend Rules (React + Vite + Tailwind CSS)

All frontend code resides in `/frontend` and follows modern React standards with TypeScript and Tailwind CSS.

## Tech Stack
- **Framework**: React 18+ (TypeScript)
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4 (utility-first, native CSS)
- **Routing**: React Router v6+
- **State Management**: React Context + custom hooks (or Zustand for complex state)
- **HTTP Client**: Axios or native fetch with typed service wrappers

## Design Aesthetic

> **MANDATORY**: The UI/UX MUST be **cozy, user-friendly, and home-oriented**.
> Strictly REJECT any harsh, technical, or traditional IT-dashboard designs.
> The platform should feel like a welcoming community tool, not a developer console.

Design guidelines:
- Soft, warm color palettes (avoid stark whites/blacks for primary backgrounds).
- Rounded corners, gentle shadows, generous spacing.
- Friendly typography (e.g., Outfit, Inter, or similar warm sans-serif fonts).
- Smooth micro-animations and transitions for user interactions.
- Accessible, inclusive design that non-technical users find comfortable.

## Workspace Structure

The frontend will serve two main product surfaces from one codebase:

### `app-builder-canvas`
- No-code visual site composition interface.
- Drag-and-drop widget placement on a grid canvas.
- Widget settings panel for layout/styling configuration.
- Instant preview mode.

### `app-cms-dashboard`
- Dynamic content management workflows.
- Collection/record CRUD interface.
- JSONB field editor for custom schema definitions.
- Media library with S3 upload integration.

## File & Folder Structure
```
frontend/src/
├── components/          # Reusable generic UI components
│   ├── ui/              # Primitives (Button, Input, Modal, Card)
│   └── layout/          # Shell, Sidebar, Navbar, PageWrapper
├── pages/               # Route-level page components
│   ├── auth/            # Login, Register
│   ├── dashboard/       # Admin overview
│   ├── builder/         # Canvas builder workspace
│   ├── cms/             # Collection & record management
│   └── recruitment/     # AI CV, Interview, Career tools
├── hooks/               # Custom reusable hooks (useAuth, useFetch, useDebounce)
├── context/             # React Context providers (AuthContext, ThemeContext)
├── services/            # API client wrappers organized by backend domain
│   ├── authService.ts
│   ├── siteService.ts
│   ├── dataService.ts
│   ├── mediaService.ts
│   └── aiService.ts
├── types/               # Shared TypeScript interfaces/types
├── utils/               # Helper functions
├── App.tsx              # Root component with router
├── main.tsx             # Entry point
└── index.css            # Tailwind CSS import + theme config
```

## Component Standards
- Write ALL components as functional components with TypeScript.
- Use typed `interface` for all props (never `any`).
- Keep components under 150 lines. Split into sub-components when exceeded.
- Colocate component-specific types and hooks within the component directory.

## Icon Standards
- Use ONLY the `lucide-react` library for all icons.
- DO NOT use arbitrary SVG files, other icon libraries, or emojis as icons.
- Import icons explicitly: `import { IconName } from 'lucide-react';`


## Media Upload Rules
- File uploads go **directly to S3** using Presigned URLs obtained from the `media` API.
- The frontend NEVER sends file binary to the NestJS backend.
- Upload flow:
  1. Request a Presigned URL from `POST /api/v1/media/presigned-url`.
  2. Upload the file directly to S3 using the Presigned URL.
  3. Call `POST /api/v1/media/confirm` with the S3 key to register metadata.

## Styling Rules (Tailwind CSS v4)
- Style components utility-first. Avoid custom CSS files unless importing vendor styles.
- Use responsive prefixes: `sm:`, `md:`, `lg:`, `xl:` for all layout decisions.
- Use Tailwind's theme system for consistent color, spacing, and typography tokens.
- Maintain warm, cozy aesthetic aligned with the design philosophy.
