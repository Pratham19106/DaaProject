import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Trash2 } from 'lucide-react';
import { chatAPI } from '../lib/api';
import Message from './Message';

export default function ChatInterface({ conversationId, context, setContext }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm TripPeIndia, your AI travel assistant for India. I'll help you plan the perfect trip!\n\nTo get started, tell me:\n- Where would you like to visit?\n- When are you traveling?\n- What's your budget?\n- What are your interests?\n\nOr just ask me anything about traveling in India!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Expose sendMessage function globally for Plan Trip button
  useEffect(() => {
    window.tripPeIndiaChat = async (message) => {
      // Create user message
      const userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setLoading(true);

      try {
        const response = await chatAPI.sendMessage(message, conversationId, context);
        
        const assistantMessage = {
          role: 'assistant',
          content: response.data.text,
          timestamp: new Date(),
          functionCalls: response.data.functionCallsMade,
          data: response.data.data,
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        const errorMessage = {
          role: 'assistant',
          content: `❌ Sorry, I encountered an error: ${error.message}. Please try again.`,
          timestamp: new Date(),
          isError: true,
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    };
    return () => {
      delete window.tripPeIndiaChat;
    };
  }, [conversationId, context]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(input, conversationId, context);
      
      const assistantMessage = {
        role: 'assistant',
        content: response.data.text,
        timestamp: new Date(),
        functionCalls: response.data.functionCallsMade,
        data: response.data.data, // Include structured data (hotels, attractions, etc.)
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: `❌ Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (confirm('Clear conversation history?')) {
      await chatAPI.clearConversation(conversationId);
      setMessages([messages[0]]); // Keep welcome message
      setContext({});
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-card border rounded-lg flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="border-b px-6 py-5 flex items-center justify-between bg-muted/30">
        <div>
          <h2 className="text-xl font-bold">Chat</h2>
          <p className="text-base text-muted-foreground">
            {messages.length - 1} messages
          </p>
        </div>
        <button
          onClick={handleClear}
          className="p-2.5 hover:bg-accent rounded-lg transition-colors"
          title="Clear conversation"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.map((msg, idx) => (
          <Message key={idx} message={msg} />
        ))}
        {loading && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-base font-medium">TripPeIndia is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t px-6 py-5 bg-muted/20">
        <div className="flex gap-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about destinations, hotels, restaurants, transport..."
            className="flex-1 px-5 py-4 text-base border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            rows="3"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-7 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-3 font-medium">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
