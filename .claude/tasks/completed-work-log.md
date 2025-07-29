# Newman AT - Development Tasks

## Current Sprint

### ✅ Completed Tasks
- [x] Initialize Node.js project with dependencies
- [x] Set up Express server with EJS templating  
- [x] Create Vue 3 frontend with Bootstrap UI
- [x] Implement Newman integration for test execution
- [x] Build collection management (CRUD operations)
- [x] Build environment management (CRUD operations)
- [x] Design responsive UI with Bootstrap components
- [x] Create real-time test runner with SSE
- [x] Add CLAUDE.md documentation
- [x] Create README.md with setup instructions
- [x] Create update-docs slash command
- [x] Separate frontend and backend into SPA architecture
- [x] Create Vue 3 project with Vite
- [x] Implement Vue Router and API services
- [x] Remove EJS templating from backend
- [x] Convert backend to pure REST API
- [x] Configure development proxy
- [x] Update documentation for new architecture

### 🔄 In Progress
- [ ] None currently

### 📋 Planned Tasks
- [ ] Add collection validation before upload
- [ ] Implement test history/results storage
- [ ] Add export functionality for test results
- [ ] Create collection templates
- [ ] Add search/filter for collections
- [ ] Implement collection folders/categories
- [ ] Add authentication system
- [ ] Create Docker configuration
- [ ] Add unit tests
- [ ] Implement collection scheduling
- [ ] Add dark mode support
- [ ] Implement WebSocket for better real-time updates
- [ ] Add collection import from URL
- [ ] Create CLI tool for CI/CD integration

## Review Section

### Latest Changes Summary (SPA Migration)
- **Separated Frontend/Backend Architecture**
  - Created standalone Vue 3 SPA in `frontend/` directory
  - Moved all backend code to `backend/` directory
  - Removed EJS templating, converted to pure REST API

- **Frontend Implementation**
  - Set up Vue 3 with Vite for fast development
  - Implemented Vue Router for client-side routing
  - Created service layer for API communication
  - Migrated all views to Vue components
  - Configured proxy for development

- **Backend Changes**
  - Removed all view rendering code
  - Focused on REST API endpoints only
  - Added health check endpoint
  - Improved error handling

- **Development Experience**
  - Added concurrent running of frontend/backend
  - Separate package.json for better dependency management
  - Hot module replacement for frontend development

### Technical Decisions
- **Vue 3 Composition API**: More flexible and TypeScript-ready
- **Vite**: Faster build tool compared to webpack
- **Separate Directories**: Clear separation of concerns
- **No Build Step for API**: Backend remains simple Node.js
- **File-based Storage**: Kept simple approach, no database needed

### Architecture Benefits
1. **Independent Deployment**: Frontend and backend can be deployed separately
2. **Better Performance**: Client-side routing, no page reloads
3. **Modern Development**: HMR, better debugging, modern tooling
4. **Scalability**: Can scale frontend/backend independently
5. **API Reusability**: Backend API can be used by other clients

### Next Steps
1. Test the new SPA architecture thoroughly
2. Consider adding state management with Pinia for complex features
3. Implement progressive web app (PWA) features
4. Add comprehensive error boundaries
5. Consider TypeScript migration for better type safety