# UXperiment-Labs

A comprehensive platform for UI component development, experimentation, and sharing. UXperiment-Labs allows users to explore, customize, and implement modern UI components with ease.

## Project Overview

UXperiment-Labs is a full-stack application that provides developers and designers with a library of ready-to-use UI components, styles, and templates. The platform offers different subscription plans that grant access to premium features.

The system is built with a modern tech stack:
- **Frontend**: Next.js with React and TypeScript
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT and Google OAuth

## System Architecture

The application follows a client-server architecture:

### Frontend (Next.js)
- Implements App Router structure
- Uses React context for state management
- Provides responsive UI with modern design principles
- Implements role-based access control (user vs admin)

### Backend (NestJS)
- RESTful API with modular architecture
- Integration with Prisma ORM for database operations
- Authentication with JWT and Google OAuth strategies
- Role-based authorization for protected resources

### Database (PostgreSQL)
- Relational database with robust schema
- Models for users, components, subscriptions, plans, and analytics

## Key Features

### Component Library
- Browse and search UI components by category
- Preview components with interactive demos
- Copy HTML and CSS code for direct implementation
- Favorite components for quick access

### Subscription System
- Multiple plan tiers (free, basic, premium)
- Subscription management with renewal and cancellation
- Payment processing integration
- Access control for premium content

### User Authentication
- Email/password login
- Google OAuth integration
- Session management with JWT
- Role-based permissions (admin vs regular users)

### Admin Dashboard
- User management
- Component management
- Subscription management
- Analytics and statistics

## Data Models

The application includes the following primary data models:

### User
- Authentication details (email, password, Google ID)
- Profile information (name, picture)
- Role (user or admin)
- Relationship with subscriptions and favorites

### Component
- UI component details (name, CSS content, HTML content)
- Categorization and styling
- View statistics

### Subscription
- User-plan relationship
- Start and end dates
- Status (active, cancelled, expired, pending)
- Payment information

### Plan
- Pricing tier details (name, description, price)
- Duration and features
- Discount information

### Statistics
- Analytics for component views
- User activity metrics
- Subscription and revenue tracking

## Setup and Installation

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- npm or pnpm

### Development Environment Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/UXperiment-Labs.git
   cd UXperiment-Labs
   ```

2. Install dependencies:
   ```
   npm run install-all
   ```
   
3. Configure environment variables:
   - Create `.env` file in the `back-end` directory with database connection string and JWT secret

4. Start development servers:
   ```
   npm run dev
   ```
   This will start both frontend and backend servers in development mode.

## Project Structure

```
UXperiment-Labs/
├── back-end/                # NestJS backend
│   ├── prisma/              # Database schema and migrations
│   │   ├── schema.prisma    # Prisma schema definition
│   │   └── migrations/      # Database migrations
│   └── src/                 # Source code
│       ├── auth/            # Authentication module
│       ├── components/      # Components module
│       ├── favoritos/       # Favorites module
│       ├── plans/           # Subscription plans module
│       ├── statistics/      # Analytics module
│       ├── subscription/    # Subscription module
│       └── users/           # Users module
│
├── front-end/               # Next.js frontend
│   ├── public/              # Static assets
│   └── src/                 # Source code
│       ├── app/             # Next.js App Router
│       │   ├── components/  # UI components
│       │   ├── styles/      # CSS styles page
│       │   ├── adm/         # Admin dashboard
│       │   └── subscription/# Subscription management
│       ├── contexts/        # React contexts
│       ├── hooks/           # Custom React hooks
│       ├── services/        # API services
│       └── types/           # TypeScript type definitions
```

## Role-Based Features

### Regular User Features
- Browse and search for components
- View component details and code
- Save components as favorites
- Subscribe to premium plans
- Access styles and templates
- Manage subscription

### Admin Features
- Manage components (create, edit, delete)
- Manage users (view, edit roles)
- Manage subscription plans
- View platform statistics
- Access to all components without requiring a subscription

## Business Rules

1. Administrators cannot have subscriptions in the system.
2. Components can be marked as premium and only accessible to users with active subscriptions.
3. Subscriptions have specific durations and expiration dates.
4. Users can cancel subscriptions at any time but will retain access until the end of their current billing period.
5. The system tracks component views and other statistics for analytics purposes.

## API Documentation

The API provides endpoints for all major features:

### Authentication
- `POST /auth/login` - Authenticate user
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/redirect` - Handle Google OAuth callback

### Users
- `POST /users` - Create a new user
- `GET /users/login` - User login
- `GET /users/:userId` - Get user details

### Components
- `GET /components` - List all components
- `GET /components/:id` - Get component details
- `POST /components` - Create a component (admin only)
- `PUT /components/:id` - Update a component (admin only)
- `DELETE /components/:id` - Delete a component (admin only)

### Subscriptions
- `GET /subscriptions/plans` - List available plans
- `GET /subscriptions/user/:userId` - Get user subscriptions
- `POST /subscriptions` - Create a subscription
- `PATCH /subscriptions/:id/cancel` - Cancel a subscription

### Favorites
- `GET /favoritos/user/:userId` - Get user favorites
- `POST /favoritos` - Add component to favorites
- `DELETE /favoritos/:id` - Remove component from favorites

## License

This project is proprietary and confidential. © 2025 UXperiment-Labs.

## Contributors

- Development Team
- UI/UX Design Team
- Product Management Team
