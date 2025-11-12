import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const OLLAMA_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';

// Create axios instances
const backendApi = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
});

const ollamaApi = axios.create({
  baseURL: OLLAMA_URL,
  timeout: 30000,
});

// Get Google Maps configuration
export const getMapConfig = async () => {
  try {
    const response = await backendApi.get('/api/maps-config');
    return response.data;
  } catch (error) {
    console.error('Failed to get map config:', error);
    throw error;
  }
};

// Search places using backend proxy
export const searchPlaces = async (query, location = null) => {
  try {
    const response = await backendApi.post('/api/places/search', {
      query,
      location
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search places:', error);
    throw error;
  }
};

// Geocode an address
export const geocodeAddress = async (address) => {
  try {
    const response = await backendApi.post('/api/geocode', { address });
    return response.data;
  } catch (error) {
    console.error('Failed to geocode:', error);
    throw error;
  }
};

// Call local LLM (Ollama)
export const queryLLM = async (userMessage) => {
  try {
    const prompt = `You are a helpful location assistant. User asked: "${userMessage}". 

Extract the search query for finding places. Respond with ONLY a JSON object in this exact format:
{"search_query": "the place type or name to search", "intent": "find_place"}

Examples:
User: "Find Italian restaurants" -> {"search_query": "Italian restaurants", "intent": "find_place"}
User: "Where can I get coffee?" -> {"search_query": "coffee shops", "intent": "find_place"}
User: "Best pizza places" -> {"search_query": "pizza restaurants", "intent": "find_place"}
User: "Show me gyms nearby" -> {"search_query": "gyms", "intent": "find_place"}

Respond with ONLY the JSON object, no other text.`;

    const response = await ollamaApi.post('/api/generate', {
      model: 'llama3.2',
      prompt,
      stream: false
    });

    const llmResponse = response.data.response;
    
    // Extract JSON from response
    const jsonMatch = llmResponse.match(/\{[^}]+\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.error('LLM query failed:', error);
    throw error;
  }
};

// Health check
export const checkHealth = async () => {
  try {
    const response = await backendApi.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error' };
  }
};

export default {
  getMapConfig,
  searchPlaces,
  geocodeAddress,
  queryLLM,
  checkHealth
};