import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const chatAPI = {
  sendMessage: async (message, conversationId = null, context = {}) => {
    const response = await axios.post(`${API_BASE}/api/chat`, {
      message,
      conversationId,
      context,
    });
    return response.data;
  },

  clearConversation: async (conversationId) => {
    const response = await axios.delete(`${API_BASE}/api/conversation/${conversationId}`);
    return response.data;
  },
};
