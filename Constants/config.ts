// Debug environment variables
console.log('🔧 Environment Variables Debug:');
console.log('EXPO_PUBLIC_BACKEND_API_URL:', process.env.EXPO_PUBLIC_BACKEND_API_URL);
console.log('Fallback URL:', 'http://localhost:8080/api/v1');

// App configuration constants
export const CONFIG = {
  // API configuration - uses EXPO_PUBLIC_BACKEND_API_URL from env variable
  API_BASE_URL: process.env.EXPO_PUBLIC_BACKEND_API_URL || 'http://localhost:8080/api/v1',
  
  // Google Play Billing
  GOOGLE_PLAY_LICENSE_KEY: process.env.EXPO_PUBLIC_GOOGLE_PLAY_LICENSE_KEY || '',
  
  // Wallet limits
  MIN_WALLET_AMOUNT: 1,
  MAX_WALLET_AMOUNT: 100000,
  MIN_WITHDRAWAL_AMOUNT: 100,
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 10,
  
  // Currency
  CURRENCY: 'INR',
  CURRENCY_SYMBOL: '₹',
  
  // Payment method
  PAYMENT_METHOD: 'google_play_billing',
  
  // Default profile photos
  DEFAULT_USER_PROFILE_PHOTO: 'https://strmly-videos-dev-mumbai.s3.ap-south-1.amazonaws.com/defaut_user_profile_photo.jpg',
  DEFAULT_COMMUNITY_PROFILE_PHOTO: 'https://strmly-videos-dev-mumbai.s3.ap-south-1.amazonaws.com/default_commuity_profile_photo.jpg'
};

export default CONFIG;