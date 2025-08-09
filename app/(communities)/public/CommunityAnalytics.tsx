import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Image,
    Alert
} from 'react-native';
import { ChevronLeft, ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { CONFIG } from '@/Constants/config';
import { communityActions } from '@/api/community/communityActions';

interface CommunityStats {
    communityFee?: number;
    totalCreators?: number;
    totalVideos?: number;
    totalFollowers?: number;
    totalLikes?: number;
    totalViews?: number;
    totalShares?: number;
    totalEarnings?: number;
}

interface RecentActivity {
    id: string;
    user: {
        name: string;
        avatar: string;
    };
    action: string;
    timestamp: string;
}

const CommunityAnalytics = () => {
    const [activeTab, setActiveTab] = useState<'non-revenue' | 'revenue'>('revenue');
    const [timeFilter, setTimeFilter] = useState('Last 30 Days');
    const [showTimeDropdown, setShowTimeDropdown] = useState(false);
    const [stats, setStats] = useState<CommunityStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    
    const router = useRouter();
    const { token } = useAuthStore();

    const timeFilterOptions = [
        'Last 7 Days',
        'Last 30 Days',
        'Last 90 Days',
        'Last Year'
    ];

    useEffect(() => {
        fetchCommunityData();
    }, [activeTab, timeFilter]);

    const fetchCommunityData = async () => {
        if (!token) {
            console.error('❌ No token available');
            return;
        }

        setLoading(true);
        try {
            // First, get user's communities to get a real community ID
            const userCommunitiesResponse = await fetch(
                `${CONFIG.API_BASE_URL}/community/user-communities?type=created`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (userCommunitiesResponse.ok) {
                const userCommunitiesData = await userCommunitiesResponse.json();
                const userCommunities = userCommunitiesData.communities || [];
                
                if (userCommunities.length > 0) {
                    // Use the first community the user created
                    const firstCommunity = userCommunities[0];
                    
                    try {
                        // Use the correct community analytics API function
                        const analyticsResponse = await communityActions.getCommunityAnalytics(token, firstCommunity._id);
                        
                        if (analyticsResponse.success) {
                            const analytics = analyticsResponse.analytics;
                            setStats({
                                communityFee: analytics.earnings.communityFees.totalEarned,
                                totalCreators: analytics.creators.total,
                                totalVideos: analytics.content.totalContent,
                                totalFollowers: analytics.followers.total,
                                totalLikes: analytics.engagement.totalLikes,
                                totalViews: analytics.engagement.totalViews,
                                totalShares: analytics.engagement.totalShares,
                                totalEarnings: analytics.earnings.totalEarnings
                            });
                            
                            // Set recent activity from top performing content
                            const recentActivities: RecentActivity[] = [];
                            
                            // Add top videos as recent activity
                            analytics.topPerforming.videos.forEach((video: any, index: number) => {
                                if (index < 3) { // Show only top 3
                                    recentActivities.push({
                                        id: video._id,
                                        user: {
                                            name: video.created_by?.username || 'Unknown',
                                            avatar: video.created_by?.profile_photo || ''
                                        },
                                        action: `uploaded "${video.name}" - ${video.views} views, ${video.likes} likes`,
                                        timestamp: new Date(video.createdAt || Date.now()).toLocaleDateString()
                                    });
                                }
                            });
                            
                            setRecentActivity(recentActivities);
                        } else {
                            throw new Error(analyticsResponse.message || 'Failed to get analytics');
                        }
                    } catch (apiError) {
                        console.log('Analytics API call failed:', apiError);
                        // Use basic community data as fallback
                        setStats({
                            communityFee: firstCommunity.community_fee_amount || 0,
                            totalCreators: firstCommunity.creators?.length || 0,
                            totalVideos: (firstCommunity.long_videos?.length || 0) + (firstCommunity.series?.length || 0),
                            totalFollowers: firstCommunity.followers?.length || 0
                        });
                        setRecentActivity([]); // Don't show error messages
                    }
                } else {
                    // User has no communities
                    setStats({
                        communityFee: 0,
                        totalCreators: 0,
                        totalVideos: 0,
                        totalFollowers: 0
                    });
                    setRecentActivity([]);
                }
            } else {
                // Fallback to zero stats if can't get user communities
                setStats({
                    communityFee: 0,
                    totalCreators: 0,
                    totalVideos: 0,
                    totalFollowers: 0
                });
                setRecentActivity([]);
            }

        } catch (error) {
            console.error('Error fetching community data:', error);
            // Set empty stats on error
            setStats({
                communityFee: 0,
                totalCreators: 0,
                totalVideos: 0,
                totalFollowers: 0
            });
            setRecentActivity([]);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(0)}k`;
        }
        return num.toString();
    };

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 mt-12">
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-2xl font-semibold" style={{ fontFamily: 'Poppins' }}>Analytics</Text>
                <View className="w-6" />
            </View>

            <ScrollView className="flex-1 px-4">
                {/* Tab Switcher */}
                <View className="flex-row mt-6 mb-6">
                    <TouchableOpacity
                        onPress={() => setActiveTab('non-revenue')}
                        className={`flex-1 pb-3 ${activeTab === 'non-revenue' ? 'border-b-2 border-white' : ''}`}
                    >
                        <Text className={`text-center text-xl ${activeTab === 'non-revenue' ? 'text-white font-semibold' : 'text-gray-400'}`} style={{ fontFamily: 'Poppins' }}>
                            Non-revenue
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('revenue')}
                        className={`flex-1 pb-3 ${activeTab === 'revenue' ? 'border-b-2 border-white' : ''}`}
                    >
                        <Text className={`text-center text-xl ${activeTab === 'revenue' ? 'text-white font-semibold' : 'text-gray-400'}`} style={{ fontFamily: 'Poppins' }}>
                            Revenue
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#F1C40F" />
                    </View>
                ) : (
                    <>
                        {/* Stats Card */}
                        <LinearGradient
                            colors={['#000000', '#0a0a0a', '#1a1a1a']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="rounded-2xl p-6 mb-6"
                            style={{ 
                                width: 360, 
                                height: activeTab === 'revenue' ? 110 : 166, 
                                alignSelf: 'center',
                                borderRadius: 10 
                            }}
                        >
                            {/* Time Filter */}
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-white text-lg font-medium" style={{ fontFamily: 'Inter' }}>
                                    {activeTab === 'revenue' ? 'Community fee' : 'Total creators'}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowTimeDropdown(!showTimeDropdown)}
                                    className="flex-row items-center border border-gray-600 rounded-lg px-3 py-2"
                                >
                                    <Text className="text-white text-sm mr-2" style={{ fontFamily: 'Inter' }}>{timeFilter}</Text>
                                    <ChevronDown size={16} color="white" />
                                </TouchableOpacity>
                            </View>

                            {/* Time Filter Dropdown */}
                            {showTimeDropdown && (
                                <View className="absolute right-6 top-20 rounded-lg border border-gray-600 z-10" style={{ backgroundColor: '#0a0a0a' }}>
                                    {timeFilterOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            onPress={() => {
                                                setTimeFilter(option);
                                                setShowTimeDropdown(false);
                                            }}
                                            className="px-4 py-3 border-b border-gray-700 last:border-b-0"
                                        >
                                            <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>{option}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Main Stat */}
                            <Text className="text-white text-3xl font-bold mb-4" style={{ fontFamily: 'Inter' }}>
                                {activeTab === 'revenue' 
                                    ? `₹ ${stats?.communityFee || '0'}` 
                                    : `${stats?.totalCreators || '0'}`
                                }
                            </Text>

                            {/* Stats Content */}
                            {activeTab === 'non-revenue' ? (
                                <View className="space-y-2">
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-base" style={{ fontFamily: 'Inter' }}>Total Videos</Text>
                                        <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>{stats ? formatNumber(stats.totalVideos || 0) : '0'}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-base" style={{ fontFamily: 'Inter' }}>Total followers</Text>
                                        <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>{stats ? formatNumber(stats.totalFollowers || 0) : '0'}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-base" style={{ fontFamily: 'Inter' }}>Total likes</Text>
                                        <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>{stats ? formatNumber(stats.totalLikes || 0) : '0'}</Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-base" style={{ fontFamily: 'Inter' }}>Total views</Text>
                                        <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>{stats ? formatNumber(stats.totalViews || 0) : '0'}</Text>
                                    </View>
                                </View>
                            ) : (
                                <View className="space-y-2">
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-400 text-base" style={{ fontFamily: 'Inter' }}>Total earnings</Text>
                                        <Text className="text-white text-base" style={{ fontFamily: 'Inter' }}>₹{stats ? (stats.totalEarnings || 0) : '0'}</Text>
                                    </View>
                                </View>
                            )}
                        </LinearGradient>

                        {/* Recent Activity - Only show if there's actual activity */}
                        {recentActivity.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-white text-2xl font-semibold mb-4">Recent</Text>
                                <View className="space-y-4">
                                    {recentActivity.map((activity) => (
                                        <View key={activity.id} className="flex-row items-center">
                                            <Image
                                                source={{ uri: activity.user.avatar }}
                                                className="w-10 h-10 rounded-full mr-3"
                                            />
                                            <View className="flex-1">
                                                <Text className="text-white text-lg">
                                                    <Text className="font-semibold">{activity.user.name}</Text>
                                                    <Text className="text-gray-400"> {activity.action}</Text>
                                                </Text>
                                                <Text className="text-gray-500 text-base">{activity.timestamp}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
};

export default CommunityAnalytics;