import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import ContextPanel from './components/ContextPanel';

function App() {
  const [conversationId] = useState(() => uuidv4());
  const [context, setContext] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const chatInterfaceRef = useState(null)[1];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handlePlanTrip = () => {
    // Build initial message from context
    const message = `Plan a trip to ${context.destination} from ${context.startDate} to ${context.endDate} for ${context.adults} adults${context.children > 0 ? ` and ${context.children} children` : ''} with a budget of ₹${context.budgetInr}${context.interests?.length > 0 ? ` interested in ${context.interests.join(', ')}` : ''}${context.hotelClass ? ` preferring ${context.hotelClass} hotels` : ''}${context.diet && context.diet !== 'any' ? ` with ${context.diet} dietary preference` : ''}.`;
    
    // Trigger chat with this message
    if (window.tripPeIndiaChat) {
      window.tripPeIndiaChat(message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Context Panel */}
          <div className="lg:col-span-1">
            <ContextPanel context={context} setContext={setContext} onPlanTrip={handlePlanTrip} />
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <ChatInterface 
              conversationId={conversationId}
              context={context}
              setContext={setContext}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
