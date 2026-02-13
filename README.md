# Retrospective App

A real-time retrospective board for agile teams with hidden cards and configurable columns.

This was built by AI (Opus 4.5) in 5 minutes using a simple prompt: "Write me a plan for a retrospective app with cards that are hidden by default from other users until revealed. There should be configurable columns. Let me know if you need any more clarification"

It clarified tech stack (React + Node.js/Express), should collaboration be real-time? (yes), How should users be identified (simple name, no password), How should data be stored? (Session-based with no persistence)

## Features

- **Real-time collaboration** - All changes sync instantly via WebSocket
- **Hidden cards** - Cards are blurred/hidden from other users until revealed
- **Configurable columns** - Add, edit, and delete columns
- **Simple name entry** - No passwords required, just enter your name
- **Session-based** - Share a link to invite team members
- **Reveal modes** - Individual card reveal or reveal all at once

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. Install server dependencies:
```bash
cd server
npm install
```

2. Install client dependencies:
```bash
cd client
npm install
```

### Running the App

1. Start the server (in one terminal):
```bash
cd server
npm run dev
```

2. Start the client (in another terminal):
```bash
cd client
npm run dev
```

3. Open http://localhost:5173 in your browser

### Usage

1. Enter your name and click "Create New Retrospective"
2. Share the link with your team members
3. Team members enter their name and join using the shared link
4. Add cards to columns - cards are hidden from others by default
5. Click "Reveal" on your cards when ready to share
6. Use "Reveal All Cards" to show all cards at once

## Tech Stack

- **Frontend:** React + Vite, Socket.io-client, React Router
- **Backend:** Node.js, Express, Socket.io
- **Storage:** In-memory (session-based)

## Project Structure

```
retroapp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Session context with Socket.io
│   │   ├── hooks/          # Custom hooks
│   │   └── App.jsx         # Main app with routing
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── index.js        # Express + Socket.io setup
│   │   ├── sessionStore.js # In-memory storage
│   │   └── socketHandlers.js
│   └── package.json
└── README.md
```
