import { useState, useEffect } from 'react';
import { CONFIG } from '../../../Constants/config';
import { useAuthStore } from '../../../store/useAuthStore';

interface TrendingVideo {
  _id: string;
  name: string;
  thumbnailUrl: string;
  description?: string;
  views: number;
  likes: number;
  created_by: {
    _id: string;
    username: string;
    profile_photo?: string;
  };
  community: {
    _id: string;
    name: string;
    profile_photo?: string;
  };
  createdAt: string;
}

interface UseTrendingVideosReturn {
  trendingVideos: TrendingVideo[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTrendingVideos = (): UseTrendingVideosReturn => {
  const { token } = useAuthStore();
  const [trendingVideos, setTrendingVideos] = useState<TrendingVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingVideos = async () => {
    if (!token) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/v1/community/trending-videos?limit=20`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch trending videos: ${response.status}`);
      }

      const data = await response.json();
      
      // Debug logging
      console.log('Trending Videos API Response:', {
        totalVideos: data.videos?.length || 0,
      });

      setTrendingVideos(data.videos || []);
    } catch (err) {
      console.error('Error fetching trending videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trending videos');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch trending videos on component mount
  useEffect(() => {
    fetchTrendingVideos();
  }, [token]);

  return {
    trendingVideos,
    isLoading,
    error,
    refetch: fetchTrendingVideos
  };
};