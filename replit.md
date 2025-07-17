# Room Management System

## Overview

This is a full-stack room rental management system built with React frontend and Express backend. The application helps manage rental properties, track monthly rent and electricity payments, and provides comprehensive reporting capabilities. It uses a clean, modern UI with ShadCN components and Tailwind CSS styling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: ShadCN UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful endpoints with JSON responses
- **Development**: Hot module replacement with Vite integration
- **Session Management**: Express sessions with PostgreSQL store

### Project Structure
```
├── client/          # React frontend application
├── server/          # Express backend application
├── shared/          # Shared TypeScript types and schemas
├── migrations/      # Database migration files
└── dist/           # Production build output
```

## Key Components

### Database Schema
- **Rooms Table**: Stores room information with JSON-based monthly data
- **Settings Table**: Global application settings (base rent, electricity rates)
- **Monthly Data Structure**: Nested JSON containing rent and electricity payment details for each month

### Storage Layer
- **Interface**: `IStorage` defining data access methods
- **Implementation**: `MemStorage` for development with in-memory data
- **Production**: Designed to use PostgreSQL with Drizzle ORM

### Frontend Components
- **Dashboard**: Main room grid view with payment status indicators
- **Overview**: Tabular view of all rooms with export functionality
- **Settings**: Global configuration management
- **Room Modal**: Payment entry and management interface
- **Navigation**: Month selection and routing

### API Endpoints
- `GET /api/rooms` - Retrieve all rooms
- `GET /api/rooms/:id` - Get specific room details
- `POST /api/rooms/:id/month/:month` - Update room data for specific month
- `GET /api/settings` - Get global settings
- `POST /api/settings` - Update global settings

## Data Flow

1. **Client Request**: Frontend makes API calls using TanStack Query
2. **Server Processing**: Express routes handle requests and validate data
3. **Database Operations**: Storage layer performs CRUD operations
4. **Response**: JSON data returned to client
5. **UI Updates**: React components re-render with new data

### Payment Tracking Flow
1. User selects month via navigation
2. Room cards display payment status for selected month
3. Clicking "Manage" opens modal with payment forms
4. Form submission updates room's monthly data
5. UI reflects changes immediately via optimistic updates

## External Dependencies

### Frontend Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management
- **@hookform/resolvers**: Form validation integration
- **class-variance-authority**: Type-safe CSS class variants
- **date-fns**: Date manipulation utilities
- **wouter**: Lightweight routing

### Backend Dependencies
- **drizzle-orm**: Type-safe database ORM
- **@neondatabase/serverless**: Neon database driver
- **express**: Web framework
- **connect-pg-simple**: PostgreSQL session store
- **zod**: Runtime type validation

### Development Dependencies
- **vite**: Frontend build tool
- **tsx**: TypeScript execution
- **esbuild**: Backend bundling
- **drizzle-kit**: Database migrations and introspection

## Deployment Strategy

### Development
- Frontend: Vite dev server with HMR
- Backend: tsx with auto-restart
- Database: Local PostgreSQL or Neon development database

### Production Build
1. Frontend: `vite build` creates optimized static assets
2. Backend: `esbuild` bundles server code with external dependencies
3. Database: `drizzle-kit push` applies schema changes
4. Static files served by Express in production

### Environment Configuration
- `NODE_ENV`: Controls development vs production behavior
- `DATABASE_URL`: PostgreSQL connection string
- `REPL_ID`: Replit-specific environment detection

### Key Design Decisions

1. **Monorepo Structure**: Shared types and utilities between frontend and backend
2. **JSON Storage**: Monthly data stored as JSON for flexibility
3. **Memory Storage**: Development-friendly in-memory storage with easy PostgreSQL migration
4. **Component Library**: ShadCN for consistent, accessible UI components
5. **Type Safety**: End-to-end TypeScript with runtime validation via Zod
6. **Query Optimization**: TanStack Query for efficient data fetching and caching
7. **Carry-Forward Logic**: Automatic balance forwarding from previous month to current month

### Recent Changes

- **2025-01-16**: Implemented carry-forward logic for rent and electricity bills
  - Added `carryForward` and `carryForwardFrom` fields to monthly data schema
  - Created `getRoomForMonth` API endpoint for automatic carry-forward calculation
  - Updated room modal to display carry-forward information with badges
  - Fixed navigation component to eliminate nested anchor warnings
  - Balances from previous month automatically added to current month's due amount
  - Visual indicators show which month unpaid amounts are carried forward from

- **2025-01-16**: Integrated Firebase Firestore for persistent data storage
  - Added Firebase Admin SDK with proper service account authentication
  - Created FirestoreStorage class implementing IStorage interface
  - Automatic fallback to in-memory storage when Firebase credentials unavailable
  - Lazy initialization of Firebase to avoid startup issues
  - Maintains all existing functionality including carry-forward logic
  - Requires Firestore API to be enabled in Google Cloud Console

- **2025-01-17**: Migrated project from Replit Agent to Replit environment
  - Fixed Firebase hosting configuration to use correct build directory (dist/public)
  - Created comprehensive deployment scripts and guides
  - Added proper HTML title and meta tags for SEO
  - Prepared project for seamless Firebase deployment with hosting and functions
  - All dependencies installed and project running successfully in Replit
  - Created troubleshooting guide for blank page issues on Firebase hosting