# Newman AT - Advanced Testing Tool

A modern web application for running and managing Postman collections using Newman. Features a clean UI with real-time test execution feedback.

## Features

- 📁 **Collection Management** - Upload, view, edit, delete, and clone Postman collections
- 🌍 **Environment Variables** - Manage environment files with upload, edit, delete, and clone functionality
- ▶️ **Real-time Runner** - Execute collections with live streaming results and SSE support
- 📊 **Detailed Results** - View comprehensive test results with HTML-like reporting, including assertions, response data, and execution times
- ⭐ **Default Collection** - Set a default collection for quick access in the Runner
- 🎨 **Modern UI** - Clean Bootstrap 5 design with Vue 3 composition API
- 📝 **Test Result Storage** - Persistent storage of test results with detailed execution history
- 🔄 **Clone Feature** - Duplicate collections and environments with one click

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd newman-at

# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start
```

## Usage

1. **Start the server**: Run `npm run dev` to start both frontend (port 5173) and backend (port 3000)

2. **Manage Collections**: 
   - Go to Collections page
   - Upload Postman collection JSON files
   - Set a default collection with the star button
   - Clone collections for variations
   - Edit collections in the built-in JSON editor

3. **Manage Environments**:
   - Go to Environments page  
   - Upload environment JSON files
   - Clone environments for different scenarios
   - Edit environment variables directly

4. **Run Tests**:
   - Go to Runner page
   - Default collection auto-selects if configured
   - Choose collection and environment
   - Set iteration count
   - Click "Run Collection" for real-time streaming results

5. **View Results**:
   - Go to Results page
   - View all test execution history
   - Click "View" for detailed results
   - See assertions, response data, and timings
   - Delete old results or clear all

## Quick Start Example

```bash
# 1. Start the development server
npm run dev

# 2. Open browser to http://localhost:5173

# 3. Upload the sample collection
# Navigate to Collections > Upload > Select "simple-api-tests.json"

# 4. Upload the sample environment
# Navigate to Environments > Upload > Select "newman-at-local.json"

# 5. Run tests
# Navigate to Runner > Select collection & environment > Run Collection

# 6. View detailed results
# Navigate to Results > Click "View" on any test run
```

## API Endpoints

### Collections
- `GET /api/collections` - List all collections
- `GET /api/collections/:filename` - Get specific collection
- `POST /api/collections/upload` - Upload new collection
- `PUT /api/collections/:filename` - Update collection
- `DELETE /api/collections/:filename` - Delete collection
- `POST /api/collections/:filename/clone` - Clone a collection

### Environments
- `GET /api/environments` - List all environments
- `GET /api/environments/:filename` - Get specific environment
- `POST /api/environments/upload` - Upload new environment
- `PUT /api/environments/:filename` - Update environment
- `DELETE /api/environments/:filename` - Delete environment
- `POST /api/environments/:filename/clone` - Clone an environment

### Test Execution
- `POST /api/newman/run` - Execute collection with streaming results (SSE)

### Results
- `GET /api/results` - List all test results
- `GET /api/results/:id` - Get detailed result
- `DELETE /api/results/:id` - Delete specific result
- `DELETE /api/results` - Delete all results

### Settings
- `GET /api/settings` - Get application settings
- `PUT /api/settings/default-collection` - Set default collection

### Health Check
- `GET /api/health` - API health status

## Technologies Used

- **Backend**: Node.js, Express.js, Newman
- **Frontend**: Vue 3, Bootstrap 5, EJS
- **Real-time**: Server-Sent Events (SSE)
- **File Management**: Express-fileupload

## Project Structure

```
newman-at/
├── frontend/               # Vue 3 SPA
│   ├── src/
│   │   ├── components/    # Vue components
│   │   ├── views/         # Page components
│   │   │   ├── Home.vue         # Landing page with stats
│   │   │   ├── Collections.vue  # Collection management
│   │   │   ├── Environments.vue # Environment management
│   │   │   ├── Runner.vue       # Test execution interface
│   │   │   └── Results.vue      # Test results viewer
│   │   ├── router/        # Vue Router configuration
│   │   ├── services/      # API service layer
│   │   │   ├── api.js           # Axios instance
│   │   │   ├── collections.js   # Collections API
│   │   │   ├── environments.js  # Environments API
│   │   │   ├── newman.js        # Newman runner API
│   │   │   ├── results.js       # Results API
│   │   │   └── settings.js      # Settings API
│   │   └── main.js        # App entry point
│   └── package.json
├── backend/               # Express API server
│   ├── routes/            # API route handlers
│   │   ├── collections.js       # Collection CRUD + clone
│   │   ├── environments.js      # Environment CRUD + clone
│   │   ├── newman.js            # Test execution with SSE
│   │   ├── results.js           # Results management
│   │   └── settings.js          # App settings
│   ├── collections/       # Stored collection JSON files
│   ├── environments/      # Stored environment JSON files
│   ├── results/           # Stored test result files
│   ├── settings.json      # Application settings
│   ├── server.js          # Express server setup
│   └── package.json
├── .claude/               # Development documentation
│   ├── tasks/             # Task management
│   │   ├── project-roadmap.md     # Visual project overview
│   │   └── completed-work-log.md  # Detailed work log
│   ├── README.md          # Documentation index
│   └── update-docs.md     # Documentation update command
├── CLAUDE.md              # Claude Code guidance
├── README.md              # This file
└── package.json           # Root package scripts
```

## Requirements

- Node.js 14+ 
- npm or yarn
- Modern web browser with JavaScript enabled

## License

ISC