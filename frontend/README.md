# TripPeIndia Frontend

A modern, responsive React + Vite frontend for the TripPeIndia AI travel assistant.

## Features

- ✨ Beautiful, modern UI with Tailwind CSS
- 🚀 Fast development with Vite
- 💬 Real-time chat interface with AI assistant
- 📋 Trip planning form with multiple options
- 🎨 Smooth animations with Framer Motion
- 📱 Fully responsive design
- 🔄 Real-time message updates

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ChatMessage.jsx    # Individual chat message component
│   └── TripForm.jsx       # Trip planning form
├── App.jsx                # Main application component
├── main.jsx               # React entry point
└── index.css              # Global styles
```

## API Integration

The frontend communicates with the backend API at `http://localhost:3001`:

- **POST /api/chat** - Send a message and get AI response
- **DELETE /api/conversation/:id** - Clear a conversation

## Environment Variables

The app uses the following proxy configuration in `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  },
}
```

## Development

The development server runs on `http://localhost:5173` with hot module replacement enabled.

## Building

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## License

MIT
