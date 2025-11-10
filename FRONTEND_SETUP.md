# TripPeIndia Frontend - Setup & Features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend running on `http://localhost:3001`

### Installation & Running

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## ✨ Features Implemented

### 1. **Modern Chat Interface**
- Real-time messaging with bot responses
- Markdown rendering for rich text
- Smooth animations and transitions
- Message timestamps
- Loading indicators

### 2. **Trip Planning Form**
- Destination input
- Date range selection
- Number of travelers
- Budget input (in rupees)
- Multi-select interests (10 categories)
- Form validation
- Sticky sidebar on desktop

### 3. **PDF Export**
- Automatic detection of PDF export requests
- One-click PDF download
- Proper file naming with destination and date
- Error handling and loading states

### 4. **Conversation Management**
- Unique conversation IDs
- Message history tracking
- Clear conversation button
- Trip context preservation
- Message counting

### 5. **Responsive Design**
- Mobile-first approach
- Tablet and desktop optimized
- Gradient background
- Clean, modern UI
- Professional color scheme

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatMessage.jsx       # Message display with markdown
│   │   ├── TripForm.jsx          # Trip planning form
│   │   ├── PDFExportButton.jsx   # PDF export functionality
│   │   └── [other components]
│   ├── App.jsx                   # Main application
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles
├── index.html                    # HTML template
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS config
├── postcss.config.js             # PostCSS config
└── package.json                  # Dependencies
```

## 🔌 API Endpoints Used

### Chat
- **POST** `/api/chat`
  - Send message and get AI response
  - Payload: `{ message, conversationId, context }`
  - Response: `{ success, data: { response, functionCallsMade, data } }`

### Conversation
- **DELETE** `/api/conversation/:id`
  - Clear conversation history
  - Response: `{ success, message }`

### Export
- **POST** `/api/export/pdf`
  - Generate and download PDF
  - Payload: PDF data JSON
  - Response: PDF blob

## 🎨 UI Components

### ChatMessage
- Displays user and bot messages
- Renders markdown with syntax highlighting
- Shows PDF export button when applicable
- Error message styling
- Timestamps

### TripForm
- Collects trip details
- 10 interest categories
- Form validation
- Sticky positioning
- Responsive grid

### PDFExportButton
- Detects PDF export requests
- Parses JSON from markdown
- Downloads PDF file
- Error handling

## 🛠️ Technologies

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Markdown** - Markdown rendering
- **Axios** - HTTP client

## 📝 Keyboard Shortcuts

- **Enter** - Send message
- **Shift + Enter** - New line in message

## 🎯 Key Features

✅ Markdown rendering with tables, code blocks, lists
✅ PDF export with automatic naming
✅ Conversation history management
✅ Trip context tracking
✅ Error handling and display
✅ Loading states
✅ Responsive mobile design
✅ Smooth animations
✅ Message counting
✅ Timestamps on all messages

## 🚀 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## 📦 Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "axios": "^1.7.2",
  "lucide-react": "^0.395.0",
  "framer-motion": "^11.2.10",
  "react-markdown": "^9.0.1",
  "remark-gfm": "^4.0.0"
}
```

## 🐛 Troubleshooting

### Backend not connecting
- Ensure backend is running on `http://localhost:3001`
- Check CORS configuration in backend

### Styles not loading
- Clear browser cache
- Restart dev server: `npm run dev`

### PDF export not working
- Check backend `/api/export/pdf` endpoint
- Verify PDF data format in bot response

## 📞 Support

For issues or questions, check the backend logs and browser console for error messages.
