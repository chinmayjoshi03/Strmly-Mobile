import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { profileActions, User, Community } from '@/api/profile/profileActions';
import { useAuthStore } from '@/store/useAuthStore';

export type SectionType = 'followers' | 'following' | 'myCommunity' | 'community';

interface UseProfileSectionsProps {
  initialSection?: SectionType;
}

export const useProfileSections = ({ initialSection = 'followers' }: UseProfileSectionsProps = {}) => {
  const { token } = useAuthStore();
  const [activeSection, setActiveSection] = useState<SectionType>(initialSection);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<(User | Community)[]>([]);
  const [counts, setCounts] = useState({
    followers: 0,
    following: 0,
    myCommunity: 0,
    community: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [countsLoaded, setCountsLoaded] = useState(false);

  // Fetch all counts initially
  const fetchAllCounts = useCallback(async () => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    try {
      const [followersResult, followingResult, myCommunitiesResult, joinedCommunitiesResult] = await Promise.all([
        profileActions.getUserFollowers(token),
        profileActions.getUserFollowing(token),
        profileActions.getUserCommunities(token, 'created'),
        profileActions.getUserCommunities(token, 'joined'),
      ]);

      setCounts({
        followers: followersResult.count || 0,
        following: followingResult.count || 0,
        myCommunity: Array.isArray(myCommunitiesResult.communities) ? myCommunitiesResult.communities.length : 0,
        community: Array.isArray(joinedCommunitiesResult.communities) ? joinedCommunitiesResult.communities.length : 0,
      });

      setCountsLoaded(true);
      console.log('✅ Fetched all counts:', {
        followers: followersResult.count || 0,
        following: followingResult.count || 0,
        myCommunity: Array.isArray(myCommunitiesResult.communities) ? myCommunitiesResult.communities.length : 0,
        community: Array.isArray(joinedCommunitiesResult.communities) ? joinedCommunitiesResult.communities.length : 0,
      });

    } catch (error) {
      console.error('❌ Error fetching counts:', error);
      // Don't show alert for count fetching errors, just log them
    }
  }, [token]);

  const fetchData = useCallback(async (section: SectionType) => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result: any;
      
      switch (section) {
        case 'followers':
          result = await profileActions.getUserFollowers(token);
          setData(result.followers || []);
          setCounts(prev => ({ ...prev, followers: result.count || 0 }));
          break;
          
        case 'following':
          result = await profileActions.getUserFollowing(token);
          setData(result.following || []);
          setCounts(prev => ({ ...prev, following: result.count || 0 }));
          break;
          
        case 'myCommunity':
          result = await profileActions.getUserCommunities(token, 'created');
          setData(result.communities || []);
          setCounts(prev => ({ 
            ...prev, 
            myCommunity: Array.isArray(result.communities) ? result.communities.length : 0 
          }));
          break;
          
        case 'community':
          result = await profileActions.getUserCommunities(token, 'joined');
          setData(result.communities || []);
          setCounts(prev => ({ 
            ...prev, 
            community: Array.isArray(result.communities) ? result.communities.length : 0 
          }));
          break;
      }

      console.log(`✅ Fetched ${section} data:`, result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      console.error(`❌ Error fetching ${section} data:`, error);
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const changeSection = useCallback((section: SectionType) => {
    setActiveSection(section);
    fetchData(section);
  }, [fetchData]);

  const refreshCurrentSection = useCallback(() => {
    fetchData(activeSection);
  }, [fetchData, activeSection]);

  const refreshAllCounts = useCallback(() => {
    fetchAllCounts();
  }, [fetchAllCounts]);

  const searchData = useCallback((query: string) => {
    if (!query.trim()) {
      return data;
    }

    const searchTerm = query.toLowerCase();
    return data.filter((item) => {
      if (activeSection === 'followers' || activeSection === 'following') {
        const user = item as User;
        return user.username?.toLowerCase().includes(searchTerm);
      } else {
        const community = item as Community;
        return community.name?.toLowerCase().includes(searchTerm);
      }
    });
  }, [data, activeSection]);

  // Initial setup - fetch all counts first, then active section data
  useEffect(() => {
    if (!countsLoaded) {
      fetchAllCounts();
    }
    fetchData(activeSection);
  }, [fetchData, fetchAllCounts, activeSection, countsLoaded]);

  const getSectionTitle = useCallback(() => {
    switch (activeSection) {
      case 'followers':
        return `${counts.followers} Followers`;
      case 'following':
        return `${counts.following} Following`;
      case 'myCommunity':
        return `${counts.myCommunity} My Community`;
      case 'community':
        return `${counts.community} Community`;
      default:
        return 'Profile';
    }
  }, [activeSection, counts]);

  return {
    activeSection,
    loading,
    data,
    counts,
    error,
    changeSection,
    refreshCurrentSection,
    refreshAllCounts,
    searchData,
    getSectionTitle,
  };
};