import { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Loader2 } from 'lucide-react';
import { queryLLM, searchPlaces } from '../services/api';
import Message from './Message';
import PlaceCard from './PlaceCard';
import './ChatSection.css';

function ChatSection({ onPlacesUpdate, onPlaceSelect }) {
  const [messages, setMessages] = useState([
    { type: 'system', content: 'AI Assistant ready! Ask me to find places to visit, eat, or explore.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          addMessage('system', 'Location detected! Ready to find places near you.');
        },
        () => {
          addMessage('system', 'Using default location. Enable location access for better results.');
        }
      );
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (type, content, places = null) => {
    setMessages(prev => [...prev, { type, content, places }]);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage('user', userMessage);
    setIsProcessing(true);

    try {
      // Query LLM to extract intent
      addMessage('assistant', 'Thinking...');
      
      const llmResult = await queryLLM(userMessage);
      
      // Remove "Thinking..." message
      setMessages(prev => prev.slice(0, -1));

      if (llmResult && llmResult.search_query) {
        const searchQuery = llmResult.search_query;
        addMessage('assistant', `Searching for: ${searchQuery}...`);

        // Search places
        const location = currentLocation 
          ? `${currentLocation.lat},${currentLocation.lng}` 
          : null;
        
        const results = await searchPlaces(searchQuery, location);

        // Remove "Searching..." message
        setMessages(prev => prev.slice(0, -1));

        if (results.results && results.results.length > 0) {
          const topPlaces = results.results.slice(0, 10);
          addMessage(
            'assistant', 
            `Found ${topPlaces.length} places! Click markers on the map for details.`,
            topPlaces.slice(0, 3) // Show top 3 as cards
          );
          onPlacesUpdate(topPlaces);
        } else {
          addMessage('assistant', 'No places found. Try a different search term or location.');
          onPlacesUpdate([]);
        }
      } else {
        addMessage(
          'assistant', 
          'I understand you want to find a place. Could you be more specific? For example: "Find sushi restaurants" or "Coffee shops near me"'
        );
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => prev.slice(0, -1)); // Remove loading message
      
      if (error.message.includes('ECONNREFUSED') || error.code === 'ERR_NETWORK') {
        addMessage(
          'system', 
          'Error: Could not connect to Ollama. Make sure Ollama is running (ollama serve) and llama3.2 is installed (ollama pull llama3.2)'
        );
      } else {
        addMessage('system', 'An error occurred. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-section">
      <div className="chat-header">
        <h1>
          <MapPin className="header-icon" />
          AI Location Assistant
        </h1>
        <p className="subtitle">
          Ask me to find restaurants, cafes, attractions, or any place you'd like to visit!
        </p>
      </div>

      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index}>
            <Message type={message.type} content={message.content} />
            {message.places && message.places.map((place, idx) => (
              <PlaceCard 
                key={idx} 
                place={place} 
                onSelect={() => onPlaceSelect(place)}
              />
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., Find me Italian restaurants nearby..."
          disabled={isProcessing}
          className="message-input"
        />
        <button 
          onClick={handleSend} 
          disabled={isProcessing || !inputValue.trim()}
          className="send-button"
        >
          {isProcessing ? (
            <Loader2 className="icon spinning" />
          ) : (
            <Send className="icon" />
          )}
        </button>
      </div>
    </div>
  );
}

export default ChatSection;