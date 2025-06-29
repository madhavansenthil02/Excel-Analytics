import axios from 'axios';

// Create axios instance
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure your Vite proxy is set up for backend
});


export const registerUserAPI = (userData) => {
  return API.post('/auth/register', userData);
};

// src/api/api.js
export const loginUserAPI = (userData) => {
  return API.post('/auth/login', userData);
};



//
// =====================
//     Excel APIs
// =====================
//

export const uploadExcelAPI = (formData) => {
  return API.post('/excel/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getParsedDataAPI = () => {
  return API.get('/excel/parsed');
};

export default API;
