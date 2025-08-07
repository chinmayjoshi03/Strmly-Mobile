import { useState, useEffect } from 'react';
import { communityActions, Community } from '@/api/community/communityActions';
import { useAuthStore } from '@/store/useAuthStore';
import { DropdownOption } from '../types';

interface UseCommunities {
  communities: DropdownOption[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch communities for video upload selection
 * Converts backend community data to dropdown options format
 */
export const useCommunities = (): UseCommunities => {
  const [communities, setCommunities] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  const fetchCommunities = async () => {
    if (!token) {
      setError('Authentication token not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching communities for upload selection...');
      const response = await communityActions.getAllCommunities(token);
      
      console.log('✅ Communities fetched:', response.communities.length);
      
      // Convert communities to dropdown options format
      const communityOptions: DropdownOption[] = [
        {
          label: 'No Community',
          value: 'none',
        },
        ...response.communities.map((community: Community) => ({
          label: community.name,
          value: community._id,
        }))
      ];
      
      setCommunities(communityOptions);
    } catch (err) {
      console.error('❌ Error fetching communities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch communities');
      
      // Fallback to basic options if API fails
      setCommunities([
        {
          label: 'No Community',
          value: 'none',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [token]);

  return {
    communities,
    loading,
    error,
    refetch: fetchCommunities,
  };
};