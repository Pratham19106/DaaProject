# 🚀 Quick Start Guide - TripPeIndia

## Installation & Setup

### Step 1: Install Frontend Dependencies

```bash
cd frontend
npm install
```

This will install all required packages including:
- ✅ uuid (for conversation IDs)
- ✅ react-markdown (for message rendering)
- ✅ axios (for API calls)
- ✅ lucide-react (for icons)
- ✅ framer-motion (for animations)

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Set Up Environment Variables

#### Backend (.env)
```
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### Step 4: Start Backend

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 TripPeIndia backend running on port 3001
AI Service: Google Gemini
Environment: development
CORS origin: http://localhost:5173
```

### Step 5: Start Frontend (in new terminal)

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.3.1 ready in ... ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Step 6: Open Application

Open your browser and go to:
```
http://localhost:5173
```

## Verification

### Check Backend Health
```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T..."
}
```

### Test Chat
1. Fill in the trip form on the left
2. Click "Plan My Trip"
3. See the message appear in chat
4. Wait for AI response
5. Continue conversation

## Common Issues

### Issue 1: "Failed to resolve import 'uuid'"
**Solution**: Run `npm install` in frontend directory

### Issue 2: Backend not responding
**Solution**: 
- Check backend is running on port 3001
- Check GEMINI_API_KEY is set
- Check CORS configuration

### Issue 3: CORS Error
**Solution**: 
- Ensure backend CORS_ORIGIN=http://localhost:5173
- Restart backend after changing .env

### Issue 4: Messages not sending
**Solution**:
- Check browser console for errors
- Check backend logs
- Verify conversation ID is UUID format

## Project Structure

```
DaaProject/
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main app
│   │   ├── components/
│   │   │   ├── ChatMessage.jsx  # Message display
│   │   │   ├── ContextPanel.jsx # Trip form
│   │   │   └── PDFExportButton.jsx
│   │   ├── lib/
│   │   │   └── api.js           # API service
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── server.js            # Express server
│   │   ├── services/
│   │   │   └── gemini.js        # AI service
│   │   ├── utils/
│   │   │   └── validators.js    # Validation
│   │   └── routes/
│   ├── package.json
│   └── .env
│
└── docs/
    ├── INTEGRATION_COMPLETE.md
    ├── BACKEND_FRONTEND_INTEGRATION.md
    └── INTEGRATION_TROUBLESHOOTING.md
```

## Features

### Chat Interface
- ✅ Real-time messaging
- ✅ Markdown rendering
- ✅ Message history
- ✅ Conversation persistence
- ✅ Error handling

### Trip Planning
- ✅ Destination input
- ✅ Date selection
- ✅ Budget input
- ✅ Traveler count
- ✅ Preset interests (8 options)
- ✅ Custom interests (unlimited)
- ✅ Hotel preference
- ✅ Dietary preference

### Advanced Features
- ✅ PDF export
- ✅ History suggestions
- ✅ Context preservation
- ✅ Clear conversation
- ✅ Responsive design

## API Endpoints

### Chat
```
POST /api/chat
Request: { message, conversationId, context }
Response: { success, data: { response, functionCallsMade, data } }
```

### Clear Conversation
```
DELETE /api/conversation/:id
Response: { success, message }
```

### PDF Export
```
POST /api/export/pdf
Request: PDF data JSON
Response: PDF blob
```

## Development

### Frontend Development
```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Development
```bash
cd backend
npm run dev      # Start with nodemon
npm run start    # Start production
npm run test     # Run tests
```

## Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy dist/ folder to hosting
```

### Backend Deployment
```bash
cd backend
npm run start
# Run on production server
```

## Support

### Documentation
- `INTEGRATION_COMPLETE.md` - Integration overview
- `BACKEND_FRONTEND_INTEGRATION.md` - Detailed integration
- `INTEGRATION_TROUBLESHOOTING.md` - Troubleshooting guide
- `VERIFICATION_CHECKLIST.md` - Verification steps

### Debugging
1. Check browser console (F12)
2. Check backend logs
3. Check Network tab in DevTools
4. Review error messages
5. Check documentation

## Next Steps

1. ✅ Install dependencies
2. ✅ Set up environment variables
3. ✅ Start backend
4. ✅ Start frontend
5. ✅ Test chat functionality
6. ✅ Review documentation
7. ✅ Deploy to production

## Contact & Support

For issues:
1. Check INTEGRATION_TROUBLESHOOTING.md
2. Review browser console
3. Check backend logs
4. Verify UUID format
5. Check API response format

---

**Version**: 1.0.0
**Last Updated**: November 10, 2025
**Status**: Production Ready
