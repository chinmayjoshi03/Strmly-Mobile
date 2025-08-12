import { useState, useEffect } from 'react';
import { getUserDashboard } from '@/api/user/userActions';

interface DashboardStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalReposts: number;
  totalWatchTime: number;
  totalFollowers: number;
  totalVideos: number;
  revenue?: number;
}

interface RevenueBreakdown {
  estimateRevenue: number;
  contentSubscription: number; // video_purchase + series_purchase
  creatorPass: number;
  giftingEarning: number; // comment_gifting + video_gifting
  communityFee: number;
  strmlyAds: number; // advertisement_earnings
}

export const useDashboard = (token: string, activeTab: 'non-revenue' | 'revenue') => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!token) {
      console.error('No auth token available');
      return;
    }

    console.log(`=== DASHBOARD FETCH ===`);
    console.log(`Tab: ${activeTab}`);
    console.log(`Token: ${token ? 'Present' : 'Missing'}`);

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching dashboard data from unified endpoint...');

      const dashboardData = await getUserDashboard(token);
      console.log('✅ Dashboard data received:', dashboardData);

      const data = dashboardData.data;

      if (activeTab === 'non-revenue') {
        // Calculate non-revenue stats from dashboard data
        const videos = data.videos?.videos || [];
        const followers = data.followers?.data || [];
        const interactions = data.interactions || {};
        const communities = data.communities?.created || [];

        // Calculate totals
        const totalFollowers = data.followers?.count || 0;
        const totalVideos = videos.length;
        const totalViews = videos.reduce((sum: number, video: any) => sum + (video.views || 0), 0);
        const totalLikes = videos.reduce((sum: number, video: any) => sum + (video.likes || 0), 0);
        const totalComments = interactions.comments?.length || 0;
        const totalReposts = interactions.reshares?.length || 0;
        const totalWatchTime = data.watch_time || 0;

        console.log('✅ Non-revenue data calculated:', {
          totalFollowers,
          totalVideos,
          totalViews,
          totalLikes,
          totalComments,
          totalReposts,
          totalWatchTime
        });

        setStats({
          totalViews,
          totalLikes,
          totalComments,
          totalReposts,
          totalWatchTime,
          totalFollowers,
          totalVideos,
        });

      } else {
        console.log('Processing revenue data...');

        const earnings = data.earnings || {};
        const videos = data.videos?.videos || [];

        // Calculate revenue stats
        const totalViews = videos.reduce((sum: number, video: any) => sum + (video.views || 0), 0);
        const totalLikes = videos.reduce((sum: number, video: any) => sum + (video.likes || 0), 0);
        const totalVideos = videos.length;

        // Calculate total revenue
        const totalRevenue = Object.values(earnings).reduce((sum: number, value: any) => sum + (Number(value) || 0), 0);

        // Combine earnings as requested
        const contentSubscription = (earnings.video_purchase_earnings || 0) + (earnings.series_purchase_earnings || 0);
        const giftingEarning = (earnings.comment_gifting_earnings || 0) + (earnings.video_gifting_earnings || 0);

        console.log('✅ Revenue data calculated:', {
          totalRevenue,
          contentSubscription,
          giftingEarning,
          creatorPass: earnings.creator_pass || 0,
          communityFee: earnings.community_fee_earnings || 0,
          strmlyAds: earnings.advertisement_earnings || 0
        });

        setStats({
          totalViews,
          totalLikes,
          totalComments: 0,
          totalReposts: 0,
          totalWatchTime: 0,
          totalFollowers: 0,
          totalVideos,
          revenue: totalRevenue
        });

        setRevenueBreakdown({
          estimateRevenue: totalRevenue,
          contentSubscription,
          creatorPass: earnings.creator_pass || 0,
          giftingEarning,
          communityFee: earnings.community_fee_earnings || 0,
          strmlyAds: earnings.advertisement_earnings || 0
        });
      }

    } catch (err: any) {
      console.error('❌ Error fetching dashboard data:', err);
      setError(err.message);

      // Show zeros on error as requested
      setStats({
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalReposts: 0,
        totalWatchTime: 0,
        totalFollowers: 0,
        totalVideos: 0,
        revenue: activeTab === 'revenue' ? 0 : undefined
      });

      if (activeTab === 'revenue') {
        setRevenueBreakdown({
          estimateRevenue: 0,
          contentSubscription: 0,
          creatorPass: 0,
          giftingEarning: 0,
          communityFee: 0,
          strmlyAds: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, activeTab]);

  return {
    stats,
    revenueBreakdown,
    loading,
    error,
    refetch: fetchDashboardData
  };
};