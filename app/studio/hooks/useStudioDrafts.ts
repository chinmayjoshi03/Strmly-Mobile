import { useState, useEffect } from 'react';
import { CONFIG } from '../../../Constants/config';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAuthStore } from '../../../store/useAuthStore';

interface DraftData {
  id: string;
  content_type: string;
  status: string;
  name: string;
  description: string;
  genre: string;
  last_modified: string;
  expires_at: string;
  community: any;
  series: any;
  error_message: string;
}

interface DraftsResponse {
  message: string;
  drafts: DraftData[];
  pagination: {
    page: number;
    limit: number;
    totalDrafts: number;
    totalPages: number;
    hasMore: boolean;
  };
  stats: {
    totalDrafts: number;
    expiredRemoved: number;
  };
}

interface TransformedDraft {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  date: string;
}

export const useStudioDrafts = () => {
  const [drafts, setDrafts] = useState<TransformedDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();
  const { token } = useAuthStore();

  const fetchDrafts = async () => {

    try {
      setLoading(true);
      setError(null);

      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${CONFIG.API_BASE_URL}/drafts/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch drafts: ${response.status}`);
      }

      const data: DraftsResponse = await response.json();


      // Transform drafts data for UI
      const transformedDrafts: TransformedDraft[] = data.drafts.map((draft) => ({
        id: draft.id,
        title: draft.name || 'Untitled',
        description: draft.description || '',
        thumbnail: '', // No thumbnail for drafts
        date: `Draft on ${new Date(draft.last_modified).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
        })}, ${new Date(draft.last_modified).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })}`,
      }));

      setDrafts(transformedDrafts);
    } catch (err) {
      console.error('Error fetching drafts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch drafts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const refetch = () => {
    fetchDrafts();
  };

  return {
    drafts,
    loading,
    error,
    refetch,
  };
};