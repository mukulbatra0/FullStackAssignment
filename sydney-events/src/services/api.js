import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Note: Types are removed in JavaScript version
// Event object structure:
// {
//   _id: string
//   title: string
//   description: string (optional)
//   date: string
//   time: string (optional)
//   location: string (optional)
//   imageUrl: string (optional)
//   originalUrl: string
//   price: string (optional)
//   category: string (optional)
//   featured: boolean (optional)
//   source: string
//   createdAt: string
// }

const api = {
  // Get all events with optional filtering
  getEvents: async (
    page = 1, 
    limit = 12, 
    category, 
    search,
    type
  ) => {
    const params = { page, limit };
    if (category) Object.assign(params, { category });
    if (search) Object.assign(params, { search });
    if (type) Object.assign(params, { type });
    
    const response = await axios.get(`${API_URL}/events`, { params });
    return response.data;
  },
  
  // Get a single event by ID
  getEventById: async (id) => {
    const response = await axios.get(`${API_URL}/events/${id}`);
    return response.data;
  },
  
  // Get all available event categories
  getCategories: async () => {
    const response = await axios.get(`${API_URL}/events/categories/all`);
    return response.data;
  },
  
  // Register email and get redirect URL
  registerEmailAndRedirect: async (data) => {
    const response = await axios.post(`${API_URL}/events/register-and-redirect`, data);
    return response.data;
  }
};

export default api; 