import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const chatAPI = {
  sendMessage: async (message, conversationId = null, context = {}) => {
    try {
      const response = await axios.post(`${API_BASE}/api/chat`, {
        message,
        conversationId,
        context,
      });
      return response.data;
    } catch (error) {
      console.error('Chat API Error:', error.response?.data || error.message);
      throw error;
    }
  },

  clearConversation: async (conversationId) => {
    try {
      const response = await axios.delete(`${API_BASE}/api/conversation/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Clear Conversation Error:', error.response?.data || error.message);
      throw error;
    }
  },

  exportPDF: async (pdfData) => {
    try {
      const response = await axios.post(`${API_BASE}/api/export/pdf`, pdfData, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('PDF Export Error:', error.response?.data || error.message);
      throw error;
    }
  },
};
