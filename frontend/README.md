# Todo Application - Frontend

A modern, secure, and responsive task management application built with Next.js 16+ and Better Auth.

## Features

- **User Authentication**: Secure signup and signin with JWT tokens
- **Task Management**: Create, read, update, and delete tasks
- **Task Completion Tracking**: Mark tasks as completed with timestamp
- **Priority Levels**: Organize tasks by priority (Low, Medium, High, Urgent)
- **Due Dates**: Set and track task deadlines
- **User Isolation**: Strict data separation between users
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Protected Routes**: Authentication-required pages
- **Password Strength Validation**: Strong password requirements with visual feedback
- **Token Refresh**: Seamless authentication experience with automatic token renewal

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript 5+
- **Authentication**: Better Auth with JWT tokens
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS 4+
- **UI Components**: React 19+

## Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Backend API running (see backend README)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000/api/auth
   BETTER_AUTH_SECRET=your-secret-key-change-in-production
   BETTER_AUTH_URL=http://localhost:3000
   DATABASE_URL=postgresql://user:password@localhost:5432/todo_db
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Project Structure](#project-structure) - See below

## Security Features

- JWT Authentication with token refresh
- Password strength requirements
- User data isolation
- Protected routes
- HTTPS ready

## Support

For issues or questions, contact: support@todoapp.com

---

**Version:** 1.0.0
**Last Updated:** 2026-02-07
