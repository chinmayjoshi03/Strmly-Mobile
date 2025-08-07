import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, Dimensions, TouchableOpacity, ActivityIndicator, Image, StyleSheet, ImageBackground, StatusBar, ScrollView } from "react-native";
import { View, Text, TextInput, FlatList, Dimensions, TouchableOpacity, ActivityIndicator, Image, StyleSheet, ImageBackground, StatusBar, ScrollView } from "react-native";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import ThemedText from "@/components/ThemedText";
import { useSearch } from "./hooks/useSearch";
import { communityActions } from "@/api/community/communityActions";
import { useAuthStore } from "@/store/useAuthStore";
import { communityActions } from "@/api/community/communityActions";
import { useAuthStore } from "@/store/useAuthStore";

const { width } = Dimensions.get("window");
const itemSize = width / 3;

const SearchScreen: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
    const [trendingVideos, setTrendingVideos] = useState<any[]>([]);
    const [trendingLoading, setTrendingLoading] = useState<boolean>(false);
    const [trendingError, setTrendingError] = useState<string>('');
    const [trendingVideos, setTrendingVideos] = useState<any[]>([]);
    const [trendingLoading, setTrendingLoading] = useState<boolean>(false);
    const [trendingError, setTrendingError] = useState<string>('');
    const tabs = ["Videos", "Accounts", "Communities"];
    
    const { token } = useAuthStore();
    const { searchResults, isLoading: searchLoading, error: searchError, performSearch, clearSearch } = useSearch();
    const router = useRouter();

    const [fontsLoaded] = useFonts({
        'Poppins-Regular': require('../../assets/fonts/poppins/Poppins-Regular.ttf'),
        'Poppins-Bold': require('../../assets/fonts/poppins/Poppins-Bold.ttf'),
        'Poppins-SemiBold': require('../../assets/fonts/poppins/Poppins-SemiBold.ttf'),
        'Poppins-Medium': require('../../assets/fonts/poppins/Poppins-Medium.ttf'),
        'Poppins-Light': require('../../assets/fonts/poppins/Poppins-Light.ttf'),
        'Inter-Light': require('../../assets/fonts/inter/Inter-Light.ttf'),
        'Inter-SemiBold': require('../../assets/fonts/inter/Inter-SemiBold.ttf'),
        'Inter-Bold': require('../../assets/fonts/inter/Inter-Bold.ttf'),
        'Inter-ExtraBold': require('../../assets/fonts/inter/Inter-ExtraBold.ttf'),
    });

    // Load trending videos on component mount
    useEffect(() => {
        loadTrendingVideos();
    }, []);

    // Load trending videos on component mount
    useEffect(() => {
        loadTrendingVideos();
    }, []);

    // Handle search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim()) {
                setIsSearchActive(true);
                performSearch(searchQuery);
            } else {
                setIsSearchActive(false);
                clearSearch();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, performSearch, clearSearch]);

    const loadTrendingVideos = async () => {
        if (!token) return;
        
        setTrendingLoading(true);
        setTrendingError('');
        
        try {
            const response = await communityActions.getTrendingVideos(token, 20);
            console.log('Trending videos response:', response);
            setTrendingVideos(response.videos || []);
        } catch (error) {
            console.error('Error loading trending videos:', error);
            setTrendingError(error instanceof Error ? error.message : 'Failed to load trending videos');
            // Fallback to sample data if API fails
            setTrendingVideos([
                {
                    _id: '1',
                    title: 'Trending Video 1',
                    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
                    community: { name: 'Tech Community' }
                },
                {
                    _id: '2',
                    title: 'Trending Video 2',
                    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=800&q=80',
                    community: { name: 'Gaming Community' }
                },
                {
                    _id: '3',
                    title: 'Trending Video 3',
                    thumbnailUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80',
                    community: { name: 'Music Community' }
                }
            ]);
        } finally {
            setTrendingLoading(false);
        }
    };

    const loadTrendingVideos = async () => {
        if (!token) return;
        
        setTrendingLoading(true);
        setTrendingError('');
        
        try {
            const response = await communityActions.getTrendingVideos(token, 20);
            console.log('Trending videos response:', response);
            setTrendingVideos(response.videos || []);
        } catch (error) {
            console.error('Error loading trending videos:', error);
            setTrendingError(error instanceof Error ? error.message : 'Failed to load trending videos');
            // Fallback to sample data if API fails
            setTrendingVideos([
                {
                    _id: '1',
                    title: 'Trending Video 1',
                    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
                    community: { name: 'Tech Community' }
                },
                {
                    _id: '2',
                    title: 'Trending Video 2',
                    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=800&q=80',
                    community: { name: 'Gaming Community' }
                },
                {
                    _id: '3',
                    title: 'Trending Video 3',
                    thumbnailUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80',
                    community: { name: 'Music Community' }
                }
            ]);
        } finally {
            setTrendingLoading(false);
        }
    };

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
    };

    const getCurrentTabData = () => {
        if (!isSearchActive) return [];


        switch (selectedTab) {
            case 0: return searchResults.videos || [];
            case 1: return searchResults.accounts || [];
            case 2: return searchResults.communities || [];
            case 0: return searchResults.videos || [];
            case 1: return searchResults.accounts || [];
            case 2: return searchResults.communities || [];
            default: return [];
        }
    };

    // Navigation functions
    const navigateToCommunity = (communityId: string) => {
        if (communityId && communityId !== 'none') {
            console.log('🔄 Navigating to community:', communityId);
            router.push(`/(dashboard)/communities/public/${communityId}`);
        }
    };

    const navigateToProfile = (userId: string) => {
        if (userId) {
            console.log('🔄 Navigating to profile:', userId);
            router.push(`/(dashboard)/profile/public/${userId}`);
        }
    };

    // Render video items with thumbnail styling
    const renderVideoItem = ({ item }: { item: any }) => {
        const thumbnailUrl = item.thumbnail || item.posterUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
        const communityId = item.community?._id || item.community?.id || item.communityId;

        return (
            <TouchableOpacity 
                onPress={() => {
                    if (communityId) {
                        navigateToCommunity(communityId);
                    } else {
                        console.log('⚠️ No community ID found for video:', item.title);
                    }
                }}
            >
                <ImageBackground
                    source={{ uri: thumbnailUrl }}
                    style={style.imageTile}
                    source={{ uri: thumbnailUrl }}
                    style={style.imageTile}
                    imageStyle={{ resizeMode: 'cover' }}
                >
                    <View style={styles.trendingOverlay}>
                        <Text style={Searchstyles.label}>{item.title || 'Untitled'}</Text>
                        {item.community && (
                            <Text style={styles.communityLabel}>{item.community.name}</Text>
                        )}
                        {item.created_by && (
                            <Text style={styles.communityLabel}>@{item.created_by.username}</Text>
                        )}
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        );
    };

    // Render account items like followers/following in profile
    const renderAccountItem = ({ item }: { item: any }) => {
        const profilePhoto = item.profile_photo || item.profile_picture || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.username}`;
        const userId = item._id || item.id;

        return (
            <TouchableOpacity 
                style={styles.accountRow}
                onPress={() => {
                    if (userId) {
                        navigateToProfile(userId);
                    } else {
                        console.log('⚠️ No user ID found for account:', item.username);
                    }
                }}
            >
                <View style={styles.accountRowContent}>
                    <Image
                        source={{ uri: profilePhoto }}
                        style={styles.accountAvatar}
                    />
                    <View style={styles.accountInfo}>
                        <Text style={styles.accountName}>{item.username}</Text>
                        {item.bio && (
                            <Text style={styles.accountBio} numberOfLines={1}>{item.bio}</Text>
                        )}
                    </View>
                </View>
                <View style={styles.accountStats}>
                    <Text style={styles.accountStatsNumber}>
                        {item.followers_count || 0}
                    </Text>
                    <Text style={styles.accountStatsLabel}>Followers</Text>
                </View>
            </TouchableOpacity>
        );
    };

    // Render community items like communities in profile
    const renderCommunityItem = ({ item }: { item: any }) => {
        const profilePhoto = item.profile_photo || `https://api.dicebear.com/7.x/identicon/svg?seed=${item.name}`;
        const communityId = item._id || item.id;

        return (
            <TouchableOpacity 
                style={styles.communityRow}
                onPress={() => {
                    if (communityId) {
                        navigateToCommunity(communityId);
                    } else {
                        console.log('⚠️ No community ID found for community:', item.name);
                    }
                }}
            >
                <View style={styles.communityRowContent}>
                    <Image
                        source={{ uri: profilePhoto }}
                        style={styles.communityAvatar}
                    />
                    <View style={styles.communityInfo}>
                        <Text style={styles.communityName}>{item.name}</Text>
                        {item.founder && (
                            <Text style={styles.communityFounder}>@{item.founder.username}</Text>
                        )}
                    </View>
                </View>
                <View style={styles.communityStats}>
                    <View style={styles.communityStatsItem}>
                        <Text style={styles.communityStatsNumber}>
                            {item.creators?.length || 0}
                        </Text>
                        <Text style={styles.communityStatsLabel}>Creators</Text>
                    </View>
                    <View style={styles.communityStatsItem}>
                        <Text style={styles.communityStatsNumber}>
                            {item.followers?.length || 0}
                        </Text>
                        <Text style={styles.communityStatsLabel}>Followers</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Choose the appropriate render function based on the selected tab
    const renderSearchResultItem = ({ item }: { item: any }) => {
        switch (selectedTab) {
            case 0: return renderVideoItem({ item });
            case 1: return renderAccountItem({ item });
            case 2: return renderCommunityItem({ item });
            default: return renderVideoItem({ item });
        }
    };

    const renderTrendingItem = ({ item }: { item: any }) => {
        const communityId = item.community?._id || item.community?.id || item.communityId;
        
        return (
            <TouchableOpacity 
                onPress={() => {
                    if (communityId) {
                        navigateToCommunity(communityId);
                    } else {
                        console.log('⚠️ No community ID found for trending video:', item.title);
                    }
                }}
            >
                <ImageBackground
                    source={{ uri: item.thumbnailUrl || item.thumbnail || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' }}
                    style={style.imageTile}
                    imageStyle={{ resizeMode: 'cover' }}
                >
                    <View style={styles.trendingOverlay}>
                        <Text style={Searchstyles.label}>{item.title || item.name || 'Untitled'}</Text>
                        {item.community && (
                            <Text style={styles.communityLabel}>{item.community.name}</Text>
                        )}
                        {item.created_by && (
                            <Text style={styles.communityLabel}>@{item.created_by.username}</Text>
                        )}
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        );
    };

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>LOADING...</Text>
            </View>
        );
    }

    return (
        <View style={Searchstyles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
    return (
        <View style={Searchstyles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            <TextInput
                placeholder="Search"
                placeholderTextColor="#ccc"
                style={Searchstyles.searchInput}
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoCorrect={false}
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Search"
                placeholderTextColor="#ccc"
                style={Searchstyles.searchInput}
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoCorrect={false}
                autoCapitalize="none"
            />

            {/* Show tabs only when searching */}
            {isSearchActive && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={Searchstyles.SelectionTabContainer}
                    contentContainerStyle={Searchstyles.SelectionTab}
                >
                    {tabs.map((label, index) => (
                        <TouchableOpacity
                            style={[
                                Searchstyles.SelectionButton,
                                ...(selectedTab === index ? [Searchstyles.SelectedButton] : [])
                            ]}
                            key={index}
                            onPress={() => setSelectedTab(index)}
                        >
                            <ThemedText style={[
                                Searchstyles.Tab,
                                ...(selectedTab === index ? [Searchstyles.SelectedText] : [])
                            ]}>
                                {label}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
            {/* Show tabs only when searching */}
            {isSearchActive && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={Searchstyles.SelectionTabContainer}
                    contentContainerStyle={Searchstyles.SelectionTab}
                >
                    {tabs.map((label, index) => (
                        <TouchableOpacity
                            style={[
                                Searchstyles.SelectionButton,
                                ...(selectedTab === index ? [Searchstyles.SelectedButton] : [])
                            ]}
                            key={index}
                            onPress={() => setSelectedTab(index)}
                        >
                            <ThemedText style={[
                                Searchstyles.Tab,
                                ...(selectedTab === index ? [Searchstyles.SelectedText] : [])
                            ]}>
                                {label}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Loading indicator */}
            {(searchLoading || trendingLoading) && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Searching...</Text>
                </View>
            )}
            {/* Loading indicator */}
            {(searchLoading || trendingLoading) && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Searching...</Text>
                </View>
            )}

            {/* Error message */}
            {(searchError || trendingError) && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {searchError || trendingError}</Text>
                </View>
            )}


            {/* Error message */}
            {(searchError || trendingError) && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {searchError || trendingError}</Text>
                </View>
            )}



            {/* Content */}
            {!(searchLoading || trendingLoading) && (
                <FlatList
                    data={isSearchActive ? getCurrentTabData() : trendingVideos}
                    numColumns={isSearchActive ? 1 : 3}
                    key={isSearchActive ? 'search' : 'default'} // Force re-render when switching modes
                    keyExtractor={(item, index) =>
                        isSearchActive ? `search-${item.id || index}` : `default-${item._id || index}`
                    }
                    renderItem={isSearchActive ? renderSearchResultItem : renderTrendingItem}
                    contentContainerStyle={isSearchActive ? styles.searchResultsContainer : Searchstyles.grid}
                    showsVerticalScrollIndicator={false}
                    style={{ marginBottom: 80 }}
                    ListEmptyComponent={
                        isSearchActive ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    No {tabs[selectedTab].toLowerCase()} found for "{searchQuery}"
                                </Text>
                                <Text style={styles.emptySubtext}>
                                    {selectedTab === 0 && "Try searching for video names or descriptions"}
                                    {selectedTab === 1 && "Try searching for usernames or emails"}
                                    {selectedTab === 2 && "Try searching for series titles, genres, or languages"}
                                </Text>
                                <View style={styles.suggestionsContainer}>
                                    <Text style={styles.suggestionsTitle}>Try searching for:</Text>
                                    {selectedTab === 0 && (
                                        <Text style={styles.suggestionText}>• Video names or descriptions</Text>
                                    )}
                                    {selectedTab === 1 && (
                                        <Text style={styles.suggestionText}>• @username or email addresses</Text>
                                    )}
                                    {selectedTab === 2 && (
                                        <Text style={styles.suggestionText}>• "Action", "Comedy", "Drama"</Text>
                                    )}
                                    {selectedTab === 2 && (
                                        <Text style={styles.suggestionText}>• "English", "Hindi", "Tamil"</Text>
                                    )}
                                </View>
                            </View>
                        ) : null
                    }
                />
            )}
        </View>
    );
            {/* Content */}
            {!(searchLoading || trendingLoading) && (
                <FlatList
                    data={isSearchActive ? getCurrentTabData() : trendingVideos}
                    numColumns={isSearchActive ? 1 : 3}
                    key={isSearchActive ? 'search' : 'default'} // Force re-render when switching modes
                    keyExtractor={(item, index) =>
                        isSearchActive ? `search-${item.id || index}` : `default-${item._id || index}`
                    }
                    renderItem={isSearchActive ? renderSearchResultItem : renderTrendingItem}
                    contentContainerStyle={isSearchActive ? styles.searchResultsContainer : Searchstyles.grid}
                    showsVerticalScrollIndicator={false}
                    style={{ marginBottom: 80 }}
                    ListEmptyComponent={
                        isSearchActive ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>
                                    No {tabs[selectedTab].toLowerCase()} found for "{searchQuery}"
                                </Text>
                                <Text style={styles.emptySubtext}>
                                    {selectedTab === 0 && "Try searching for video names or descriptions"}
                                    {selectedTab === 1 && "Try searching for usernames or emails"}
                                    {selectedTab === 2 && "Try searching for series titles, genres, or languages"}
                                </Text>
                                <View style={styles.suggestionsContainer}>
                                    <Text style={styles.suggestionsTitle}>Try searching for:</Text>
                                    {selectedTab === 0 && (
                                        <Text style={styles.suggestionText}>• Video names or descriptions</Text>
                                    )}
                                    {selectedTab === 1 && (
                                        <Text style={styles.suggestionText}>• @username or email addresses</Text>
                                    )}
                                    {selectedTab === 2 && (
                                        <Text style={styles.suggestionText}>• "Action", "Comedy", "Drama"</Text>
                                    )}
                                    {selectedTab === 2 && (
                                        <Text style={styles.suggestionText}>• "English", "Hindi", "Tamil"</Text>
                                    )}
                                </View>
                            </View>
                        ) : null
                    }
                />
            )}
        </View>
    );
};


const style = StyleSheet.create({
    imageTile: {
        width: itemSize,
        height: itemSize * 1.4,
        height: itemSize * 1.4,
        justifyContent: "flex-end",
        alignItems: "flex-start",
    },
});

const Searchstyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingTop: 50,
    },
    searchInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        color: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 25,
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
    },
    SelectionTabContainer: {
        flexGrow: 0,
        marginBottom: 15,
    },
    SelectionTab: {
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    SelectionButton: {
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginRight: 40,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    SelectedButton: {
        borderBottomColor: '#fff',
    },
    Tab: {
        fontSize: 18,
        fontFamily: 'Poppins-Medium',
        color: '#9CA3AF',
    },
    SelectedText: {
        color: '#fff',
        fontFamily: 'Poppins-SemiBold',
    },
    grid: {
        paddingHorizontal: 5,
    },
    label: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
    },
});

const Searchstyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        paddingTop: 50,
    },
    searchInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        color: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginHorizontal: 15,
        marginBottom: 15,
        borderRadius: 25,
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
    },
    SelectionTabContainer: {
        flexGrow: 0,
        marginBottom: 15,
    },
    SelectionTab: {
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    SelectionButton: {
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginRight: 40,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    SelectedButton: {
        borderBottomColor: '#fff',
    },
    Tab: {
        fontSize: 18,
        fontFamily: 'Poppins-Medium',
        color: '#9CA3AF',
    },
    SelectedText: {
        color: '#fff',
        fontFamily: 'Poppins-SemiBold',
    },
    grid: {
        paddingHorizontal: 5,
    },
    label: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
    },
});

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontFamily: 'Poppins-Regular',
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
    },
    errorText: {
        color: '#ff6b6b',
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
    },
    searchResultsContainer: {
        padding: 10,
    },
    searchResultItem: {
        marginBottom: 15,
        borderRadius: 10,
        overflow: 'hidden',
    },
    resultImage: {
        width: '100%',
        height: 120,
        justifyContent: 'flex-end',
    },
    resultOverlay: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 15,
    },
    resultTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 5,
    },
    resultDescription: {
        color: '#ccc',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
    },
    resultMeta: {
        color: '#999',
        fontSize: 12,
        fontFamily: 'Poppins-Light',
        marginTop: 3,
    },
    trendingOverlay: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        width: '100%',
    },
    communityLabel: {
        color: '#ccc',
        fontSize: 12,
        fontFamily: 'Poppins-Light',
        marginTop: 2,
    },
    trendingOverlay: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        width: '100%',
    },
    communityLabel: {
        color: '#ccc',
        fontSize: 12,
        fontFamily: 'Poppins-Light',
        marginTop: 2,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        color: '#ccc',
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        marginBottom: 10,
    },
    emptySubtext: {
        color: '#999',
        fontSize: 14,
        fontFamily: 'Poppins-Light',
        textAlign: 'center',
        marginBottom: 20,
    },
    suggestionsContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    suggestionsTitle: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 8,
    },
    suggestionText: {
        color: '#ccc',
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        marginBottom: 4,
    },

    // Account styling (similar to followers/following in profile)
    accountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 0,
        marginBottom: 8,
    },
    accountRowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    accountAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    accountBio: {
        color: '#aaa',
        fontSize: 14,
        fontFamily: 'Poppins-Light',
        marginTop: 2,
    },
    accountStats: {
        alignItems: 'center',
    },
    accountStatsNumber: {

    // Account styling (similar to followers/following in profile)
    accountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 0,
        marginBottom: 8,
    },
    accountRowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    accountAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    accountInfo: {
        flex: 1,
    },
    accountName: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    accountBio: {
        color: '#aaa',
        fontSize: 14,
        fontFamily: 'Poppins-Light',
        marginTop: 2,
    },
    accountStats: {
        alignItems: 'center',
    },
    accountStatsNumber: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    accountStatsLabel: {
        color: '#aaa',
        fontSize: 12,
        fontFamily: 'Poppins-Light',
    },
    accountStatsLabel: {
        color: '#aaa',
        fontSize: 12,
        fontFamily: 'Poppins-Light',
    },
    // Community styling (similar to communities in profile)
    communityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 0,
        marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
    },
    communityRowContent: {
    // Community styling (similar to communities in profile)
    communityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 0,
        marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
    },
    communityRowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        alignItems: 'center',
        flex: 1,
    },
    communityAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    communityInfo: {
        flex: 1,
    communityAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    communityInfo: {
        flex: 1,
    },
    communityName: {
    communityName: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    communityFounder: {
        color: '#aaa',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    communityFounder: {
        color: '#aaa',
        fontSize: 14,
        fontFamily: 'Poppins-Light',
        marginTop: 2,
    },
    communityStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    communityStatsItem: {
        alignItems: 'center',
        marginLeft: 12,
    },
    communityStatsNumber: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    communityStatsLabel: {
        color: '#aaa',
        fontSize: 12,
        fontFamily: 'Poppins-Light',
        fontFamily: 'Poppins-Light',
        marginTop: 2,
    },
    communityStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    communityStatsItem: {
        alignItems: 'center',
        marginLeft: 12,
    },
    communityStatsNumber: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    communityStatsLabel: {
        color: '#aaa',
        fontSize: 12,
        fontFamily: 'Poppins-Light',
    },
});

export default SearchScreen;
