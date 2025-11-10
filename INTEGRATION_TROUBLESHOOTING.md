# 🔧 Integration Troubleshooting Guide

## Common Issues & Solutions

### 1. "conversationId must be a valid GUID" Error

**Symptom**: 
```
Validation error: "conversationId" must be a valid GUID
```

**Cause**: Frontend generating non-UUID format conversation IDs

**Solution**:
```javascript
// ❌ Wrong
const generateConversationId = () => {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ✅ Correct
import { v4 as uuidv4 } from 'uuid';

const generateConversationId = () => {
  return uuidv4();
};
```

**Verification**:
- Check browser console: `console.log(uuidv4())`
- Should output: `550e8400-e29b-41d4-a716-446655440000`

---

### 2. "startDate must be a valid ISO date" Error

**Symptom**:
```
Validation error: "startDate" must be a valid ISO date
```

**Cause**: Backend expecting ISO date string, not Date object

**Solution**:
```javascript
// ❌ Wrong
context.startDate = new Date("2025-12-15");

// ✅ Correct
context.startDate = "2025-12-15"; // String format
```

**Verification**:
- Frontend sends: `"2025-12-15"` (string)
- Backend validates: `Joi.string().isoDate()`

---

### 3. "otherInterests" Field Not Recognized

**Symptom**:
```
Validation error: "otherInterests" is not allowed
```

**Cause**: Backend validator doesn't include otherInterests field

**Solution**: Update backend validators.js:
```javascript
context: Joi.object({
  // ... other fields ...
  otherInterests: Joi.string().max(500).optional(),
  // ... rest of fields ...
}).optional(),
```

**Verification**:
- Check `backend/src/utils/validators.js` line 17
- Should include: `otherInterests: Joi.string().max(500).optional(),`

---

### 4. API Response Format Mismatch

**Symptom**:
```
Cannot read property 'response' of undefined
```

**Cause**: Frontend expecting different response structure

**Solution**:
```javascript
// ❌ Wrong
const text = response.data.data.response;

// ✅ Correct
const text = response.data.response;
```

**Verification**:
- Backend returns: `{ success: true, data: { response: "..." } }`
- Frontend accesses: `response.data.response`

---

### 5. CORS Error

**Symptom**:
```
Access to XMLHttpRequest blocked by CORS policy
```

**Cause**: Frontend and backend on different origins

**Solution**:
```javascript
// Frontend - lib/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Backend - server.js
app.use(cors({ origin: config.corsOrigin }));
```

**Verification**:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Backend CORS configured for `http://localhost:5173`

---

### 6. Conversation Not Persisting

**Symptom**:
```
Each message creates new conversation
```

**Cause**: conversationId not being reused

**Solution**:
```javascript
// Initialize once
if (!conversationIdRef.current) {
  conversationIdRef.current = generateConversationId();
}

// Reuse for all messages
const response = await chatAPI.sendMessage(
  input,
  conversationIdRef.current,  // ← Same ID for all messages
  context
);
```

**Verification**:
- Check browser DevTools Network tab
- All requests should have same `conversationId`

---

### 7. Context Not Being Sent

**Symptom**:
```
Backend not receiving context data
```

**Cause**: Context object empty or not passed

**Solution**:
```javascript
// ✅ Ensure context is populated
const context = {
  destination: "Jaipur",
  startDate: "2025-12-15",
  endDate: "2025-12-20",
  budgetInr: 50000,
  adults: 2,
  children: 1,
  interests: ["history", "food"],
  otherInterests: "photography, wildlife",
  hotelClass: "mid-range",
  diet: "vegetarian"
};

// Send with context
await chatAPI.sendMessage(message, conversationId, context);
```

**Verification**:
- Check Network tab: Request payload includes context
- Backend logs show context received

---

### 8. PDF Export Not Working

**Symptom**:
```
PDF export button doesn't appear or download fails
```

**Cause**: Missing PDF export endpoint or wrong format

**Solution**:
```javascript
// Ensure backend has export route
app.use('/api/export', exportRoutes);

// Frontend calls correct endpoint
const response = await axios.post(`${API_BASE}/api/export/pdf`, pdfData, {
  responseType: 'blob',
});
```

**Verification**:
- Backend has `/api/export/pdf` endpoint
- Response is blob type
- Frontend detects PDF JSON in message

---

### 9. Message Not Displaying

**Symptom**:
```
Chat appears empty or messages don't show
```

**Cause**: Message format incorrect

**Solution**:
```javascript
// ✅ Correct message format
const botMessage = {
  id: messages.length + 2,
  text: response.data.response || response.data.text || '',
  sender: 'bot',
  timestamp: new Date(),
  functionCalls: response.data.functionCallsMade || 0,
  data: response.data.data,
};

setMessages(prev => [...prev, botMessage]);
```

**Verification**:
- Check browser console: `console.log(messages)`
- Messages array should contain objects with required fields

---

### 10. Backend Not Starting

**Symptom**:
```
Cannot connect to http://localhost:3001
```

**Cause**: Backend not running or wrong port

**Solution**:
```bash
# Start backend
cd backend
npm install
npm run dev

# Should output:
# 🚀 TripPeIndia backend running on port 3001
```

**Verification**:
- Check terminal for startup message
- Visit `http://localhost:3001/health`
- Should return: `{ "status": "ok", "timestamp": "..." }`

---

## Debugging Checklist

### Frontend Debugging

```javascript
// 1. Check conversation ID
console.log('Conversation ID:', conversationIdRef.current);
// Should be: 550e8400-e29b-41d4-a716-446655440000

// 2. Check context
console.log('Context:', context);
// Should have all required fields

// 3. Check API request
console.log('Sending:', { message: input, conversationId, context });

// 4. Check API response
console.log('Response:', response);
// Should have: { success: true, data: { response: "..." } }

// 5. Check messages
console.log('Messages:', messages);
// Should be array of message objects
```

### Backend Debugging

```javascript
// 1. Check validation
console.log('Validated data:', validated);

// 2. Check conversation
console.log('Conversation ID:', conversationId);
console.log('Is UUID:', /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId));

// 3. Check context
console.log('Context:', context);

// 4. Check response
console.log('AI Response:', response);
```

---

## Network Debugging

### Check Request
```bash
# Open DevTools → Network tab
# Send message
# Click on /api/chat request
# Check:
# - Method: POST
# - URL: http://localhost:3001/api/chat
# - Headers: Content-Type: application/json
# - Payload: { message, conversationId, context }
```

### Check Response
```bash
# In same request:
# - Status: 200 OK
# - Response: { success: true, data: { response: "..." } }
```

---

## Quick Fixes

### Fix 1: Clear Browser Cache
```bash
# Hard refresh
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### Fix 2: Restart Frontend
```bash
# Stop current process (Ctrl+C)
npm run dev
```

### Fix 3: Restart Backend
```bash
# Stop current process (Ctrl+C)
cd backend
npm run dev
```

### Fix 4: Check Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### Fix 5: Check Environment
```bash
# Frontend .env (if needed)
VITE_API_URL=http://localhost:3001

# Backend .env
GEMINI_API_KEY=your_key_here
```

---

## Verification Commands

### Test Frontend
```bash
# 1. Start frontend
cd frontend
npm run dev

# 2. Open browser
http://localhost:5173

# 3. Check console
# Should be no errors
```

### Test Backend
```bash
# 1. Start backend
cd backend
npm run dev

# 2. Test health endpoint
curl http://localhost:3001/health

# 3. Should return
# { "status": "ok", "timestamp": "..." }
```

### Test Integration
```bash
# 1. Both running
# Frontend: http://localhost:5173
# Backend: http://localhost:3001

# 2. Fill form in frontend
# 3. Send message
# 4. Check Network tab for requests
# 5. Check backend logs for processing
# 6. Verify response in frontend
```

---

## Support Resources

### Files to Check
- `frontend/src/App.jsx` - Main app logic
- `frontend/src/lib/api.js` - API service
- `backend/src/server.js` - Backend server
- `backend/src/utils/validators.js` - Validation schema

### Logs to Check
- Browser Console (F12)
- Backend Terminal
- Network Tab (DevTools)

### Common Fixes
1. Restart both frontend and backend
2. Clear browser cache
3. Check UUID format
4. Verify API response format
5. Check CORS configuration

---

## When All Else Fails

1. **Check UUID Format**
   ```javascript
   // Should match this pattern
   /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
   ```

2. **Check API Response**
   ```javascript
   // Should have this structure
   {
     success: true,
     data: {
       response: "...",
       functionCallsMade: 0,
       data: {}
     }
   }
   ```

3. **Check Context Format**
   ```javascript
   // All dates should be strings
   {
     startDate: "2025-12-15",  // ✅ String
     endDate: "2025-12-20",    // ✅ String
     // NOT new Date("2025-12-15") ❌
   }
   ```

---

**Last Updated**: November 10, 2025
**Status**: Complete
**Version**: 1.0.0
