import { MapPin, Star, ExternalLink, Navigation } from 'lucide-react';
import './PlaceCard.css';

function PlaceCard({ place, onSelect }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.geometry.location.lat},${place.geometry.location.lng}&destination_place_id=${place.place_id}`;

  return (
    <div className="place-card" onClick={onSelect}>
      <div className="place-header">
        <h3>
          <MapPin className="place-icon" />
          {place.name}
        </h3>
        {place.rating && (
          <div className="rating">
            <Star className="star-icon" />
            <span>{place.rating}</span>
          </div>
        )}
      </div>
      
      <p className="place-address">
        {place.formatted_address || place.vicinity || 'Address not available'}
      </p>

      <div className="place-actions">
        <a 
          href={mapsUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="place-link"
        >
          <ExternalLink className="link-icon" />
          View on Maps
        </a>
        <a 
          href={directionsUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="place-link"
        >
          <Navigation className="link-icon" />
          Directions
        </a>
      </div>
    </div>
  );
}

export default PlaceCard;