# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Newman AT is a modern Single Page Application (SPA) that provides a user-friendly interface for running Postman collections using the Newman library. It features a separated frontend/backend architecture with Vue 3 and Express.js.

## Tech Stack

### Frontend
- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite
- **Routing**: Vue Router 4
- **State Management**: Pinia
- **UI Framework**: Bootstrap 5, Bootstrap Icons
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Core Library**: Newman (Postman collection runner)
- **Middleware**: CORS, Express-fileupload
- **Real-time**: Server-Sent Events (SSE)

## Commands

```bash
# Install all dependencies (frontend + backend)
npm install

# Development (runs both frontend and backend)
npm run dev

# Development - Backend only (API on port 3000)
npm run dev:backend

# Development - Frontend only (UI on port 5173)  
npm run dev:frontend

# Build frontend for production
npm run build

# Start backend server
npm start

# Start both frontend preview and backend
npm run start:all
```

## Architecture

### Project Structure
```
newman-at/
├── frontend/               # Vue 3 SPA
│   ├── src/
│   │   ├── components/    # Reusable Vue components
│   │   ├── views/         # Page components (Home, Collections, Environments, Runner)
│   │   ├── router/        # Vue Router configuration
│   │   ├── services/      # API service layer (api.js, collections.js, environments.js, newman.js)
│   │   ├── App.vue        # Root component with layout
│   │   └── main.js        # Application entry point
│   ├── vite.config.js     # Vite configuration with API proxy
│   └── package.json
│
├── backend/               # Express API server
│   ├── routes/            # API route handlers
│   │   ├── collections.js # CRUD operations for collections
│   │   ├── environments.js # CRUD operations for environments
│   │   └── newman.js      # Newman execution with SSE streaming
│   ├── collections/       # Stored collection JSON files
│   ├── environments/      # Stored environment JSON files
│   ├── server.js          # Express server setup
│   ├── .env              # Environment variables
│   └── package.json
│
├── .claude/              # Development documentation hub
│   ├── tasks/            # Task management
│   │   ├── project-roadmap.md     # Visual project overview & future plans
│   │   └── completed-work-log.md  # Detailed log of completed work
│   ├── README.md         # Documentation index & navigation guide
│   └── update-docs.md    # Slash command for updating docs
├── CLAUDE.md             # This file - Claude Code guidance
├── README.md             # Project documentation
└── package.json          # Root package with npm scripts
```

### Key Architecture Decisions

1. **SPA Architecture**: Frontend is a standalone Vue 3 application that communicates with backend via REST API
2. **API Design**: All backend endpoints are prefixed with `/api` for clear separation
3. **File Storage**: Collections and environments are stored as JSON files on the server (simple approach, no database needed)
4. **Real-time Updates**: Uses Server-Sent Events for streaming test execution results
5. **Development Proxy**: Vite proxies `/api` requests to backend during development

### API Endpoints

All endpoints are prefixed with `/api`:

- `GET /api/health` - Health check
- `GET /api/collections` - List all collections
- `GET /api/collections/:filename` - Get specific collection
- `POST /api/collections/upload` - Upload new collection
- `PUT /api/collections/:filename` - Update collection
- `DELETE /api/collections/:filename` - Delete collection
- `GET /api/environments` - List all environments
- `GET /api/environments/:filename` - Get specific environment
- `POST /api/environments/upload` - Upload new environment
- `PUT /api/environments/:filename` - Update environment
- `DELETE /api/environments/:filename` - Delete environment
- `POST /api/newman/run` - Execute collection with SSE streaming

### Development Notes

- Frontend dev server runs on port 5173 (Vite default)
- Backend API server runs on port 3000
- File uploads are limited to 50MB
- Collections and environments are validated as JSON before saving
- Newman execution streams results in real-time using SSE
- CORS is enabled for cross-origin requests during development

### Frontend Components

- **Home.vue**: Landing page with stats and navigation
- **Collections.vue**: Collection management with upload, view, edit, delete
- **Environments.vue**: Environment variable management
- **Runner.vue**: Test execution interface with real-time logs
- **App.vue**: Main layout with navigation and router outlet

### Backend Routes

- **collections.js**: Handles file operations for collection JSON files
- **environments.js**: Handles file operations for environment JSON files
- **newman.js**: Executes Newman with SSE streaming for real-time updates

### Standard Workflow

1. First think through the problem, read the codebase for relevant files, and write a plan to .claude/tasks/completed-work-log.md
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan
4. Then, begin working on the todo items, marking them as complete as you go
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity
7. Finally, add a review section to the completed-work-log.md file with a summary of the changes you made and any other relevant information
8. Update the project-roadmap.md file if you discover new tasks or complete major features
9. DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY
10. MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY