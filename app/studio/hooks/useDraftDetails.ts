import { useState, useEffect } from 'react';
import { CONFIG } from '../../../Constants/config';
import { useAuthStore } from '../../../store/useAuthStore';

interface DraftVideoData {
  has_video: boolean;
  video_url: string | null;
  video_s3_key: string | null;
  thumbnail_url: string | null;
  thumbnail_s3_key: string | null;
  original_filename: string | null;
  file_size: number | null;
  video_uploaded_at: string | null;
}

interface DraftDetails {
  id: string;
  content_type: string;
  status: string;
  draft_data: {
    name: string;
    description: string;
    genre: string;
    type: string;
    language: string;
    age_restriction: boolean;
    start_time: number;
    display_till_time: number;
    community_id?: string;
    series_id?: string;
  };
  video_data: DraftVideoData;
  last_modified: string;
  expires_at: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export const useDraftDetails = (draftId: string | null) => {
  const [draftDetails, setDraftDetails] = useState<DraftDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  const fetchDraftDetails = async (id: string) => {
    if (!token || !id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/drafts/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch draft details: ${response.status}`);
      }

      const data = await response.json();
      setDraftDetails(data.draft);
    } catch (err) {
      console.error('Error fetching draft details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch draft details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (draftId) {
      fetchDraftDetails(draftId);
    } else {
      setDraftDetails(null);
      setError(null);
    }
  }, [draftId, token]);

  const refetch = () => {
    if (draftId) {
      fetchDraftDetails(draftId);
    }
  };

  return {
    draftDetails,
    loading,
    error,
    refetch,
  };
};
