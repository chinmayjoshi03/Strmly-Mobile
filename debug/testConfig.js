// Test configuration loading
import { CONFIG } from '../Constants/config';

console.log('=== CONFIG TEST ===');
console.log('API_BASE_URL:', CONFIG.API_BASE_URL);
console.log('Environment variable EXPO_PUBLIC_BACKEND_API_URL:', process.env.EXPO_PUBLIC_BACKEND_API_URL);
console.log('==================');

export const testConfig = () => {
  return {
    apiUrl: CONFIG.API_BASE_URL,
    envVar: process.env.EXPO_PUBLIC_BACKEND_API_URL,
    isCorrect: CONFIG.API_BASE_URL.includes('192.168.1.36')
  };
};