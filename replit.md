# AutoFill Pro - Chrome Extension

## Overview

AutoFill Pro is a Chrome Extension that automatically fills web forms using stored user profiles. It features a React-based popup interface (400px width) where users can manage multiple profiles containing personal information like name, email, address, and phone. The extension uses a content script to detect and fill form fields on any webpage using fuzzy matching logic.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state, React Context for auth state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Build Tool**: Vite with custom path aliases (@/, @shared/, @assets/)

The frontend is designed as a Chrome Extension popup with a fixed 400px width. Custom fonts include Outfit (display) and Plus Jakarta Sans (body).

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ES modules)
- **API Design**: RESTful endpoints defined in shared/routes.ts with Zod validation
- **Authentication**: JWT-based auth with tokens stored in localStorage on client, bcryptjs for password hashing

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Schema Location**: shared/schema.ts (shared between client/server)
- **Tables**: users (id, username, password), profiles (id, userId, profileName, firstName, lastName, email, phone, address, city, zip, country)

### Chrome Extension Components
- **Manifest**: V3 with activeTab, scripting, and storage permissions
- **Content Script**: client/public/content.js - Injected into all pages to fill forms
- **Form Filling Logic**: Fuzzy matching against input name, id, placeholder, aria-label, and associated labels

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components (shadcn/ui)
    hooks/        # Custom hooks (auth, profiles, toast)
    pages/        # Route pages (auth, dashboard)
    lib/          # Utilities (queryClient, utils)
  public/         # Extension assets (manifest.json, content.js)
server/           # Express backend
  index.ts        # Entry point
  routes.ts       # API route handlers
  storage.ts      # Database abstraction layer
  db.ts           # Drizzle database connection
shared/           # Shared code
  schema.ts       # Drizzle schema definitions
  routes.ts       # API route contracts with Zod
```

### Build Process
- Development: `npm run dev` - tsx runs server with Vite middleware for HMR
- Production: `npm run build` - Vite builds client, esbuild bundles server with allowlisted dependencies

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via DATABASE_URL environment variable
- **connect-pg-simple**: Session storage (available but JWT is primary auth)

### Authentication
- **jsonwebtoken**: JWT creation and verification
- **bcryptjs**: Password hashing

### Core Libraries
- **drizzle-orm / drizzle-kit**: Database ORM and migrations
- **zod**: Runtime schema validation for API inputs/outputs
- **@tanstack/react-query**: Async state management

### UI Framework
- **shadcn/ui**: Pre-built accessible components based on Radix UI primitives
- **@radix-ui/***: Headless UI primitives (dialog, dropdown, toast, etc.)
- **tailwindcss**: Utility-first CSS
- **framer-motion**: Animation library
- **lucide-react**: Icon library

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: JWT signing secret (defaults to "default_secret_dev_only" in development)