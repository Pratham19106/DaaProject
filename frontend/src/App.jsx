import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Send, Loader, MapPin, Calendar, Users, DollarSign, Sparkles, Trash2 } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import ContextPanel from './components/ContextPanel';
import { chatAPI } from './lib/api';

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hi! I'm TripPeIndia, your AI travel assistant for India. I'll help you plan the perfect trip!\n\nTo get started, tell me:\n- Where would you like to visit?\n- When are you traveling?\n- What's your budget?\n- What are your interests?\n\nOr just ask me anything about traveling in India!",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState({});
  const messagesEndRef = useRef(null);
  const conversationIdRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateConversationId = () => {
    return uuidv4();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Initialize conversation ID on first message
    if (!conversationIdRef.current) {
      conversationIdRef.current = generateConversationId();
    }

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(input, conversationIdRef.current, context);

      const botMessage = {
        id: messages.length + 2,
        text: response.data.response || response.data.text || '',
        sender: 'bot',
        timestamp: new Date(),
        functionCalls: response.data.functionCallsMade || 0,
        data: response.data.data,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: `❌ Sorry, I encountered an error: ${error.response?.data?.error || error.message}. Please try again.`,
        sender: 'bot',
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanTrip = async () => {
    if (!context.destination || !context.startDate || !context.endDate || !context.budgetInr) {
      alert('Please fill in destination, dates, and budget to plan your trip!');
      return;
    }

    // Build message with all context
    const interestsList = [
      ...(context.interests || []),
      ...(context.otherInterests ? context.otherInterests.split(',').map(i => i.trim()) : [])
    ];

    const contextMessage = `I'm planning a trip to ${context.destination} from ${context.startDate} to ${context.endDate} for ${context.adults || 2} adults${context.children ? ` and ${context.children} children` : ''} with a budget of ₹${context.budgetInr}. I'm interested in ${interestsList.length > 0 ? interestsList.join(', ') : 'various activities'}${context.hotelClass ? `. I prefer ${context.hotelClass} hotels` : ''}${context.diet && context.diet !== 'any' ? `. My dietary preference is ${context.diet}` : ''}. Please help me plan an amazing itinerary!`;

    // Initialize conversation ID if needed
    if (!conversationIdRef.current) {
      conversationIdRef.current = uuidv4();
    }

    const userMessage = {
      id: messages.length + 1,
      text: contextMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(contextMessage, conversationIdRef.current, context);

      const botMessage = {
        id: messages.length + 2,
        text: response.data.response || response.data.text || '',
        sender: 'bot',
        timestamp: new Date(),
        functionCalls: response.data.functionCallsMade || 0,
        data: response.data.data,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: `❌ Error: ${error.response?.data?.error || error.message}`,
        sender: 'bot',
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleClearConversation = async () => {
    if (confirm('Clear conversation history?')) {
      try {
        if (conversationIdRef.current) {
          await chatAPI.clearConversation(conversationIdRef.current);
        }
        setMessages([messages[0]]);
        setContext({});
        conversationIdRef.current = null;
      } catch (error) {
        console.error('Error clearing conversation:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TripPeIndia</h1>
              <p className="text-sm text-gray-600">AI Travel Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {context.destination && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{context.destination}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{context.startDate}</span>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleClearConversation}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              title="Clear conversation"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Context Panel */}
          <div className="lg:col-span-1">
            <ContextPanel context={context} setContext={setContext} onPlanTrip={handlePlanTrip} />
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[600px]">
              {/* Header */}
              <div className="border-b border-sky-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-sky-50 to-sky-100">
                <div>
                  <h2 className="text-lg font-bold text-sky-900">Chat</h2>
                  <p className="text-sm text-sky-700">
                    {messages.length - 1} message{messages.length !== 2 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Messages - Fixed scrolling */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 bg-gradient-to-b from-sky-50 to-white">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {loading && (
                  <div className="flex items-center gap-3 text-sky-700">
                    <Loader className="w-5 h-5 animate-spin text-sky-600" />
                    <span className="text-sm font-medium">TripPeIndia is thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-sky-200 p-4 bg-gradient-to-r from-sky-50 to-sky-100">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Ask about destinations, hotels, restaurants, transport..."
                    className="flex-1 px-4 py-3 border border-sky-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none bg-white text-gray-900"
                    rows="3"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
                <p className="text-xs text-gray-600 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
