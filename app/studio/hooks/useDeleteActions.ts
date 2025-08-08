import { Alert } from 'react-native';
import { CONFIG } from '../../../Constants/config';
import { useAuthStore } from '../../../store/useAuthStore';

export const useDeleteActions = () => {
  const { token } = useAuthStore();

  const deleteDraft = async (draftId: string): Promise<boolean> => {
    try {
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('Attempting to delete draft:', draftId);
      console.log('Using endpoint:', `${CONFIG.API_BASE_URL}/drafts/${draftId}`);

      const response = await fetch(`${CONFIG.API_BASE_URL}/drafts/${draftId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete draft response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete draft error response:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to delete draft');
      }

      const responseData = await response.json();
      console.log('Delete draft success response:', responseData);
      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      throw error;
    }
  };

  const deleteSeries = async (seriesId: string): Promise<boolean> => {
    try {
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('Attempting to delete series:', seriesId);
      console.log('Using endpoint:', `${CONFIG.API_BASE_URL}/series/${seriesId}`);

      const response = await fetch(`${CONFIG.API_BASE_URL}/series/${seriesId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete series response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete series error response:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to delete series');
      }

      const responseData = await response.json();
      console.log('Delete series success response:', responseData);
      return true;
    } catch (error) {
      console.error('Error deleting series:', error);
      throw error;
    }
  };

  const deleteEpisode = async (seriesId: string, episodeId: string): Promise<boolean> => {
    try {
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('Attempting to delete episode:', episodeId, 'from series:', seriesId);

      // Try different possible endpoints for episode deletion
      const endpoints = [
        `${CONFIG.API_BASE_URL}/series/${seriesId}/episodes/${episodeId}`,
        `${CONFIG.API_BASE_URL}/episodes/${episodeId}`,
        `${CONFIG.API_BASE_URL}/videos/${episodeId}?seriesId=${seriesId}`,
      ];

      let lastError = null;

      for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i];
        console.log(`Trying endpoint ${i + 1}:`, endpoint);

        try {
          const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          console.log(`Endpoint ${i + 1} response status:`, response.status);

          if (response.ok) {
            const responseData = await response.json();
            console.log('Delete episode success response:', responseData);
            return true;
          } else {
            const errorData = await response.json();
            console.log(`Endpoint ${i + 1} error:`, errorData);
            lastError = errorData;
          }
        } catch (fetchError) {
          console.log(`Endpoint ${i + 1} fetch error:`, fetchError);
          lastError = fetchError;
        }
      }

      // If all endpoints failed, throw the last error
      throw new Error(
        lastError?.error ||
        lastError?.message ||
        'Failed to delete episode - all endpoints failed'
      );
    } catch (error) {
      console.error('Error deleting episode:', error);
      throw error;
    }
  };

  const confirmDelete = (
    type: 'draft' | 'series' | 'episode',
    name: string,
    onConfirm: () => void
  ) => {
    Alert.alert(
      `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onConfirm,
        },
      ]
    );
  };

  return {
    deleteDraft,
    deleteSeries,
    deleteEpisode,
    confirmDelete,
  };
};