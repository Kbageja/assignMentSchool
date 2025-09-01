import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// School API functions
export const schoolAPI = {
  // Get all schools
  getAll: () => api.get('/api/schools'),
  
  // Get single school
  getById: (id: number) => api.get(`/api/schools/${id}`),
  
  // Create new school
  create: (formData: FormData) => api.post('/api/schools', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Update school
  update: (id: number, formData: FormData) => api.put(`/api/schools/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Delete school
  delete: (id: number) => api.delete(`/api/schools/${id}`),
};

export default api;