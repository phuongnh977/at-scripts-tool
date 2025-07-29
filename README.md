# Newman AT - Advanced Testing Tool

A modern web application for running and managing Postman collections using Newman. Features a clean UI with real-time test execution feedback.

## Features

- 📁 **Collection Management** - Upload, view, edit, and delete Postman collections
- 🌍 **Environment Variables** - Manage environment files for different test scenarios  
- ▶️ **Real-time Runner** - Execute collections with live streaming results
- 📊 **Detailed Results** - View test assertions, response times, and execution logs
- 🎨 **Modern UI** - Clean Bootstrap design with Vue.js reactivity

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

1. **Start the server**: Run `npm run dev` and navigate to `http://localhost:3000`

2. **Upload Collections**: 
   - Go to Collections page
   - Click "Upload Collection" and select your Postman collection JSON file

3. **Upload Environments** (Optional):
   - Go to Environments page  
   - Upload environment JSON files for different test scenarios

4. **Run Tests**:
   - Go to Runner page
   - Select a collection and optionally an environment
   - Set iteration count
   - Click "Run Collection" to see real-time results

## API Endpoints

- `GET /api/collections` - List all collections
- `POST /api/collections/upload` - Upload new collection
- `PUT /api/collections/:filename` - Update collection
- `DELETE /api/collections/:filename` - Delete collection
- `GET /api/environments` - List all environments
- `POST /api/environments/upload` - Upload new environment
- `PUT /api/environments/:filename` - Update environment
- `DELETE /api/environments/:filename` - Delete environment
- `POST /api/newman/run` - Execute collection with streaming results

## Technologies Used

- **Backend**: Node.js, Express.js, Newman
- **Frontend**: Vue 3, Bootstrap 5, EJS
- **Real-time**: Server-Sent Events (SSE)
- **File Management**: Express-fileupload

## Project Structure

```
newman-at/
├── frontend/           # Vue 3 SPA
│   ├── src/
│   │   ├── components/ # Vue components
│   │   ├── views/      # Page components
│   │   ├── router/     # Vue Router config
│   │   ├── services/   # API services
│   │   └── main.js     # App entry point
│   └── package.json
├── backend/            # Express API
│   ├── routes/         # API route handlers
│   ├── collections/    # Stored collection files
│   ├── environments/   # Stored environment files
│   ├── server.js       # Express server
│   └── package.json
├── .claude/            # Development tasks and documentation
│   ├── tasks/          # Task tracking files
│   └── update-docs.md  # Documentation update slash command
├── CLAUDE.md           # Claude Code AI assistant guidance
├── README.md           # This file
└── package.json        # Root package scripts
```

## Requirements

- Node.js 14+ 
- npm or yarn
- Modern web browser with JavaScript enabled

## License

ISC