import { CONFIG } from '../../Constants/config';
import { useAuthStore } from '@/store/useAuthStore';

export interface CreateSeriesRequest {
  title: string;
  description?: string;
  genre: string;
  language?: string;
  type: 'Free' | 'Paid';
  price?: number;
  communityId?: string;
  promisedEpisodesCount: number;
}

export interface SeriesResponse {
  _id: string;
  title: string;
  description: string;
  genre: string;
  language: string;
  type: string;
  price: number;
  total_episodes: number;
  episodes: any[];
  release_date: string;
  created_by: string;
  community?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSeriesResponse {
  message: string;
  data: SeriesResponse;
}

export interface GetUserSeriesResponse {
  message: string;
  data: SeriesResponse[];
}

/**
 * Create a new series
 */
export const createSeries = async (seriesData: CreateSeriesRequest): Promise<CreateSeriesResponse> => {
  const { token } = useAuthStore.getState();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${CONFIG.API_BASE_URL}/series/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(seriesData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create series');
  }

  return response.json();
};

/**
 * Get user's series
 */
export const getUserSeries = async (): Promise<GetUserSeriesResponse> => {
  const { token } = useAuthStore.getState();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  console.log('🔑 Token being used:', token.substring(0, 50) + '...');

  const response = await fetch(`${CONFIG.API_BASE_URL}/series/user`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('📊 Response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json();
    console.log('❌ Error response:', errorData);
    throw new Error(errorData.error || 'Failed to fetch series');
  }

  const data = await response.json();
  console.log('✅ Success response:', data);
  return data;
};

/**
 * Add episode to series
 */
export const addEpisodeToSeries = async (seriesId: string, videoId: string, episodeNumber: number): Promise<any> => {
  const { token } = useAuthStore.getState();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${CONFIG.API_BASE_URL}/series/${seriesId}/episodes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      videoId,
      episodeNumber,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add episode to series');
  }

  return response.json();
};