import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import './MapSection.css';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: -6.2088,
  lng: 106.8456
};

const libraries = ['places'];

function MapSection({ apiKey, places, selectedPlace, onPlaceSelect }) {
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [activeMarker, setActiveMarker] = useState(null);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          console.log('Using default location');
        }
      );
    }
  }, []);

  // Fit bounds when places change
  useEffect(() => {
    if (map && places.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      places.forEach(place => {
        bounds.extend({
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        });
      });
      map.fitBounds(bounds);
    }
  }, [map, places]);

  // Center on selected place
  useEffect(() => {
    if (map && selectedPlace) {
      map.panTo({
        lat: selectedPlace.geometry.location.lat,
        lng: selectedPlace.geometry.location.lng
      });
      map.setZoom(15);
      setActiveMarker(selectedPlace.place_id);
    }
  }, [map, selectedPlace]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (place) => {
    setActiveMarker(place.place_id);
    onPlaceSelect(place);
  };

  const handleInfoWindowClose = () => {
    setActiveMarker(null);
  };

  if (!apiKey) {
    return (
      <div className="map-section map-loading">
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="map-section">
      <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ],
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true
          }}
        >
          {places.map((place, index) => {
            const position = {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            };

            return (
              <Marker
                key={place.place_id}
                position={position}
                onClick={() => handleMarkerClick(place)}
                label={{
                  text: (index + 1).toString(),
                  color: 'white',
                  fontWeight: 'bold'
                }}
                animation={window.google?.maps.Animation.DROP}
              >
                {activeMarker === place.place_id && (
                  <InfoWindow onCloseClick={handleInfoWindowClose}>
                    <div className="info-window">
                      <h3>{place.name}</h3>
                      <p>{place.formatted_address || place.vicinity}</p>
                      {place.rating && (
                        <p className="info-rating">⭐ {place.rating}/5</p>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            );
          })}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default MapSection;