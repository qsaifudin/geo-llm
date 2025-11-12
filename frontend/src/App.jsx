import { useState, useEffect } from 'react';
import ChatSection from './components/ChatSection';
import MapSection from './components/MapSection';
import { getMapConfig } from './services/api';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        const config = await getMapConfig();
        setApiKey(config.apiKey);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load config:', err);
        setError('Could not connect to backend. Make sure server is running on port 3001.');
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  const handlePlacesUpdate = (newPlaces) => {
    setPlaces(newPlaces);
    if (newPlaces.length > 0) {
      setSelectedPlace(newPlaces[0]);
    }
  };

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>⚠️ Connection Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-content">
        <ChatSection 
          onPlacesUpdate={handlePlacesUpdate}
          onPlaceSelect={handlePlaceSelect}
        />
        <MapSection 
          apiKey={apiKey}
          places={places}
          selectedPlace={selectedPlace}
          onPlaceSelect={handlePlaceSelect}
        />
      </div>
    </div>
  );
}

export default App;