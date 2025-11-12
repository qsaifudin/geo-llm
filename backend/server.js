const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));
app.use(express.json());

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Endpoint to provide API key (restricted, only serves to authenticated frontend)
app.get('/api/maps-config', (req, res) => {
  // In production, add authentication middleware here
  res.json({
    apiKey: process.env.GOOGLE_MAPS_API_KEY
  });
});

// Proxy endpoint for Places API (more secure alternative)
app.post('/api/places/search', async (req, res) => {
  try {
    const { query, location } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Use Google Places API Text Search
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.append('query', query);
    url.searchParams.append('key', process.env.GOOGLE_MAPS_API_KEY);
    
    if (location) {
      url.searchParams.append('location', location);
      url.searchParams.append('radius', '5000'); // 5km radius
    }

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Maps API error: ${data.status}`);
    }

    res.json(data);
  } catch (error) {
    console.error('Places search error:', error);
    res.status(500).json({ error: 'Failed to search places' });
  }
});

// Endpoint for geocoding
app.post('/api/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.append('address', address);
    url.searchParams.append('key', process.env.GOOGLE_MAPS_API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'Failed to geocode address' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API server running on port ${PORT}`);
});