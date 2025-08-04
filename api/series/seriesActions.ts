import { CONFIG } from '@/Constants/config';
import { useAuthStore } from '@/store/useAuthStore';

const API_BASE_URL = CONFIG.API_BASE_URL;

export interface AddEpisodeToSeriesRequest {
  seriesId: string;
  videoId: string;
  episodeNumber: number;
  seasonNumber?: number;
}

/**
 * Add an episode (video) to a series
 */
export const addEpisodeToSeries = async ({
  seriesId,
  videoId,
  episodeNumber,
  seasonNumber = 1
}: AddEpisodeToSeriesRequest) => {
  try {
    const { token } = useAuthStore.getState();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log(`Adding episode to series:`, {
      seriesId,
      videoId,
      episodeNumber,
      seasonNumber
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/series/${seriesId}/episodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        videoId,
        episodeNumber,
        seasonNumber
      })
    });

    const result = await response.json();
    console.log('Add episode response:', result);

    if (!response.ok) {
      throw new Error(result.error || 'Failed to add episode to series');
    }

    return result;
  } catch (error) {
    console.error('Error adding episode to series:', error);
    throw error;
  }
};

/**
 * Get user's series list
 */
export const getUserSeries = async () => {
  try {
    const { token } = useAuthStore.getState();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    console.log('Fetching user series...');

    const response = await fetch(`${API_BASE_URL}/api/v1/series/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    console.log('User series response:', result);

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch series');
    }

    return result.data || [];
  } catch (error) {
    console.error('Error fetching user series:', error);
    throw error;
  }
};