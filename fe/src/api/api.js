import axios from 'axios';

// Base URL từ Ngrok
const BASE_URL = 'https://smashing-valid-jawfish.ngrok-free.app/api';
// const BASE_URL = 'http://localhost:3003'
export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
  

