import { useState, useEffect } from 'react';
import { CONFIG } from '../../../Constants/config';
import { useAuthStore } from '../../../store/useAuthStore';

interface Episode {
  _id: string;
  name: string;
  description?: string;
  videoUrl: string;
  episode_number: number;
  season_number: number;
  views?: number;
  likes?: number;
  shares?: number;
  duration?: number;
  created_by?: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SeriesDetails {
  _id: string;
  title: string;
  description?: string;
  posterUrl?: string;
  bannerUrl?: string;
  genre: string;
  language: string;
  age_restriction: boolean;
  type: string;
  price: number;
  release_date: string;
  seasons: number;
  total_episodes: number;
  episodes: Episode[];
  created_by: {
    _id: string;
    username: string;
    email: string;
  };
  community?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const useSeriesDetails = (seriesId: string | null) => {
  const [seriesDetails, setSeriesDetails] = useState<SeriesDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  const fetchSeriesDetails = async (id: string) => {
    if (!token || !id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${CONFIG.API_BASE_URL}/series/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch series details: ${response.status}`);
      }

      const data = await response.json();
      
      // Process episodes to ensure they have videoUrl
      const processedEpisodes = data.data.episodes.map((episode: any) => ({
        ...episode,
        videoUrl: episode.videoUrl || episode.video_url || episode.url || '',
      }));

      setSeriesDetails({
        ...data.data,
        episodes: processedEpisodes,
      });
    } catch (err) {
      console.error('Error fetching series details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch series details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (seriesId) {
      fetchSeriesDetails(seriesId);
    } else {
      setSeriesDetails(null);
      setError(null);
    }
  }, [seriesId, token]);

  const refetch = () => {
    if (seriesId) {
      fetchSeriesDetails(seriesId);
    }
  };

  return {
    seriesDetails,
    loading,
    error,
    refetch,
  };
};