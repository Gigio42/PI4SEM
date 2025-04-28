import axios from 'axios';

// Define the correct backend API URL
// Change this to match your actual backend server address and port
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create an Axios instance with the correct base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(config => {
  // Make sure URL has leading slash if needed
  if (config.url && !config.url.startsWith('/') && !config.url.includes('http')) {
    config.url = '/' + config.url;
  }
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
}, error => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    
    // Check if response is HTML instead of JSON (common error when hitting wrong endpoint)
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      console.error('Received HTML response instead of JSON. This likely means the API URL is incorrect.');
      throw new Error('Received HTML response instead of expected JSON. Check API URL configuration.');
    }
    
    return response;
  },
  error => {
    console.error('API Error:', error.message);
    // Add more detailed error handling
    if (error.response) {
      const contentType = error.response.headers['content-type'];
      if (contentType && contentType.includes('text/html')) {
        console.error('Received HTML error response instead of JSON. Check if API URL is pointing to the backend server.');
      }
      
      console.error(`Error Response: Status ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('No response received from server. The server might be down or unreachable.');
      console.error(`Attempted to connect to: ${error.config?.baseURL}${error.config?.url}`);
    }
    return Promise.reject(error);
  }
);

// Export the API instance
export default api;

// Export the base URL for other services that might need it
export const apiBaseUrl = API_BASE_URL;
