import axios from 'axios';

// Create an Axios instance with the correct base URL
const api = axios.create({
  // Using the correct base URL for the backend
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cross-domain requests with credentials
});

export default api;
