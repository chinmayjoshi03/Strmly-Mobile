import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import VideoUploadFlow from '../upload/VideoUploadFlow';
import { SeriesSelectionScreen, SeriesAnalyticsScreen } from './screens';
import SimpleSeriesCreationScreen from './screens/SimpleSeriesCreationScreen';
import SeriesDetailsScreen from './screens/SeriesDetailsScreen';
import { Series } from './types';
import { useStudioDrafts } from './hooks/useStudioDrafts';
import { useSeries } from './hooks/useSeries';
import { router } from 'expo-router';



const StrmlyStudio = () => {
    const [activeTab, setActiveTab] = useState<'draft' | 'series'>('draft');
    const [selectedSeries, setSelectedSeries] = useState<string | null>('3');
    const [currentScreen, setCurrentScreen] = useState<'main' | 'upload' | 'series-creation' | 'series-selection' | 'series-analytics' | 'series-details'>('main');
    const [selectedSeriesForAnalytics, setSelectedSeriesForAnalytics] = useState<Series | null>(null);
    const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);

    // Debug state changes
    console.log('🎬 Studio State:', {
        activeTab,
        currentScreen,
        selectedSeriesId
    });

    // Use the real drafts and series hooks
    const { drafts, loading: draftsLoading, error: draftsError, refetch: refetchDrafts } = useStudioDrafts();
    const { series, loading: seriesLoading, error: seriesError, refetch: refetchSeries } = useSeries();

    // Navigation handlers
    const goToUploadFlow = () => {
        console.log('📤 Going to upload flow');
        setCurrentScreen('upload');
    };

    const goToSeriesCreation = () => {
        console.log('🎬 Going to series creation');
        setCurrentScreen('series-creation');
    };

    const goToSeriesSelection = () => {
        console.log('📋 Going to series selection');
        setCurrentScreen('series-selection');
    };

    const goToMain = () => {
        console.log('🏠 Going back to main');
        setCurrentScreen('main');
        setSelectedSeriesId(null);
    };

    const goToSeriesDetails = (seriesId: string) => {
        console.log('📊 Going to series details for:', seriesId);
        setSelectedSeriesId(seriesId);
        setCurrentScreen('series-details');
    };

    // Handle upload flow completion
    const handleUploadComplete = () => {
        refetchDrafts();
        goToMain();
    };

    // Handle upload flow cancellation
    const handleUploadCancel = () => {
        goToMain();
    };

    // Handle series creation completion
    const handleSeriesCreated = (series: Series) => {
        refetchSeries();
        setActiveTab('series');
        goToMain();
    };

    // Handle series creation back
    const handleSeriesCreationBack = () => {
        goToMain();
    };

    // Handle series selection
    const handleSeriesSelected = (series: Series) => {
        goToSeriesCreation();
    };

    // Handle add new series from selection
    const handleAddNewSeries = () => {
        goToSeriesCreation();
    };

    // Handle series selection back
    const handleSeriesSelectionBack = () => {
        goToMain();
    };

    // Render screens based on currentScreen state
    if (currentScreen === 'upload') {
        return (
            <VideoUploadFlow
                onComplete={handleUploadComplete}
                onCancel={handleUploadCancel}
            />
        );
    }

    if (currentScreen === 'series-creation') {
        console.log('🎬 Rendering SimpleSeriesCreationScreen');
        return (
            <SimpleSeriesCreationScreen
                onBack={handleSeriesCreationBack}
                onSeriesCreated={handleSeriesCreated}
            />
        );
    }

    if (currentScreen === 'series-selection') {
        return (
            <SeriesSelectionScreen
                onBack={handleSeriesSelectionBack}
                onSeriesSelected={handleSeriesSelected}
                onAddNewSeries={handleAddNewSeries}
            />
        );
    }

    if (currentScreen === 'series-details' && selectedSeriesId) {
        return (
            <SeriesDetailsScreen
                seriesId={selectedSeriesId}
                onBack={goToMain}
                onAddNewEpisode={() => {
                    // TODO: Navigate to episode creation
                    console.log('Add new episode clicked');
                }}
            />
        );
    }

    if (currentScreen === 'series-analytics' && selectedSeriesForAnalytics) {
        return (
            <SeriesAnalyticsScreen
                series={selectedSeriesForAnalytics}
                onBack={goToMain}
                onEditAccess={() => { }}
                onAddNewEpisode={() => { }}
                onEpisodeMenuPress={() => { }}
            />
        );
    }



    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 mt-12">
                <TouchableOpacity>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-2xl font-medium">Strmly studio</Text>
                <View className="w-6" />
            </View>

            {/* Tab Navigation */}
            <View className="flex-row py-4">
                <TouchableOpacity
                    className="flex-1 items-center"
                    onPress={() => setActiveTab('draft')}
                >
                    <Text className={`text-2xl font-medium ${activeTab === 'draft' ? 'text-white' : 'text-gray-400'}`}>
                        My draft
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-1 items-center"
                    onPress={() => setActiveTab('series')}
                >
                    <Text className={`text-2xl font-medium ${activeTab === 'series' ? 'text-white' : 'text-gray-400'}`}>
                        Series
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content List */}
            <ScrollView className="flex-1 px-4">
                {activeTab === 'draft' ? (
                    // Drafts List
                    <>
                        {draftsLoading ? (
                            <View className="flex-1 items-center justify-center py-20">
                                <ActivityIndicator size="large" color="#F1C40F" />
                                <Text className="text-gray-400 mt-2">Loading drafts...</Text>
                            </View>
                        ) : draftsError ? (
                            <View className="flex-1 items-center justify-center py-20">
                                <Text className="text-red-400 text-center mb-4">
                                    Error loading drafts: {draftsError}
                                </Text>
                                <TouchableOpacity
                                    onPress={refetchDrafts}
                                    className="bg-gray-600 px-4 py-2 rounded-lg"
                                >
                                    <Text className="text-white">Retry</Text>
                                </TouchableOpacity>
                            </View>
                        ) : drafts.length === 0 ? (
                            <View className="flex-1 items-center justify-center py-20">
                                <Ionicons name="document-outline" size={48} color="#666" />
                                <Text className="text-gray-400 text-center mt-4">
                                    No drafts yet
                                </Text>
                                <Text className="text-gray-500 text-center mt-2">
                                    Upload a video to create your first draft
                                </Text>
                            </View>
                        ) : (
                            drafts.map((draft) => (
                                <TouchableOpacity
                                    key={draft.id}
                                    onPress={() => {
                                        console.log('🎬 Opening draft:', draft.id);
                                        router.push(`/studio/components/DraftVideoPlayer?id=${draft.id}`);
                                    }}
                                >
                                    <LinearGradient
                                        colors={['#000000', '#0a0a0a', '#1a1a1a']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        className="flex-row items-center rounded-lg p-3 mb-3"
                                        style={{
                                            shadowColor: '#ffffff',
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 2,
                                            elevation: 3,
                                        }}
                                    >
                                        <View className="w-12 h-12 rounded-lg mr-3 overflow-hidden">
                                            {draft.thumbnail ? (
                                                <Image
                                                    source={{ uri: draft.thumbnail }}
                                                    className="w-full h-full"
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View className="w-full h-full items-center justify-center">
                                                    <Image
                                                        source={require('../../assets/drafts-icon.png')}
                                                        style={{ width: 50, height: 50 }}
                                                        resizeMode="contain"
                                                    />
                                                </View>
                                            )}
                                        </View>

                                        <View className="flex-1">
                                            <Text className="text-white text-lg font-medium">{draft.title}</Text>
                                            <Text className="text-gray-400 text-base">{draft.date}</Text>
                                            {draft.description && (
                                                <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
                                                    {draft.description}
                                                </Text>
                                            )}
                                        </View>

                                        <TouchableOpacity className="p-2">
                                            <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))
                        )}
                    </>
                ) : (
                    // Series List
                    <>
                        {seriesLoading ? (
                            <View className="flex-1 items-center justify-center py-20">
                                <ActivityIndicator size="large" color="#F1C40F" />
                                <Text className="text-gray-400 mt-2">Loading series...</Text>
                            </View>
                        ) : seriesError ? (
                            <View className="flex-1 items-center justify-center py-20">
                                <Text className="text-red-400 text-center mb-4">
                                    Error loading series: {seriesError}
                                </Text>
                                <TouchableOpacity
                                    onPress={refetchSeries}
                                    className="bg-gray-600 px-4 py-2 rounded-lg"
                                >
                                    <Text className="text-white">Retry</Text>
                                </TouchableOpacity>
                            </View>
                        ) : series.length === 0 ? (
                            <View className="flex-1 items-center justify-center py-20">
                                <Svg width={48} height={48} viewBox="0 0 41 40" fill="none">
                                    <Path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M28.1193 31.4285V20C28.1193 18.9896 27.718 18.0206 27.0035 17.3062C26.2891 16.5918 25.3202 16.1904 24.3098 16.1904H7.16695C6.1566 16.1904 5.18763 16.5918 4.47321 17.3062C3.75878 18.0206 3.35742 18.9896 3.35742 20V31.4285C3.35742 32.4389 3.75878 33.4078 4.47321 34.1223C5.18763 34.8367 6.1566 35.238 7.16695 35.238H24.3098C25.3202 35.238 26.2891 34.8367 27.0035 34.1223C27.718 33.4078 28.1193 32.4389 28.1193 31.4285Z"
                                        stroke="#666"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                    <Path
                                        d="M31.9284 31.4285V18.1047C31.9284 16.5891 31.3264 15.1357 30.2548 14.0641C29.1831 12.9924 27.7297 12.3904 26.2141 12.3904H26.2046L9.07129 12.4209"
                                        stroke="#666"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                    <Path
                                        d="M35.738 27.619V16.2038C35.738 14.1831 34.9353 12.2451 33.5064 10.8163C32.0776 9.38744 30.1397 8.58472 28.119 8.58472H28.1056L12.8809 8.60948"
                                        stroke="#666"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        fill="none"
                                    />
                                </Svg>
                                <Text className="text-gray-400 text-center mt-4">
                                    No series yet
                                </Text>
                                <Text className="text-gray-500 text-center mt-2">
                                    Create your first series to get started
                                </Text>
                            </View>
                        ) : (
                            series.map((seriesItem) => (
                                <TouchableOpacity
                                    key={seriesItem.id}
                                    onPress={() => goToSeriesDetails(seriesItem.id)}
                                >
                                    <LinearGradient
                                        colors={['#000000', '#0a0a0a', '#1a1a1a']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        className={`flex-row items-center rounded-lg p-3 mb-3 ${selectedSeries === seriesItem.id ? 'border-2 border-blue-500' : ''
                                            }`}
                                        style={{
                                            shadowColor: '#ffffff',
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 2,
                                            elevation: 3,
                                        }}
                                    >
                                        <View className="w-12 h-12 mr-3 items-center justify-center">
                                            {seriesItem.thumbnail ? (
                                                <Image
                                                    source={{ uri: seriesItem.thumbnail }}
                                                    className="w-full h-full rounded"
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <Image
                                                    source={require('../../assets/episode.png')}
                                                    style={{ width: 32, height: 32 }}
                                                    resizeMode="contain"
                                                />
                                            )}
                                        </View>

                                        <View className="flex-1">
                                            <Text className="text-white text-lg font-medium" numberOfLines={1}>
                                                {seriesItem.title}
                                            </Text>
                                            <Text className="text-gray-400 text-base">{seriesItem.date}</Text>
                                            <Text className="text-gray-500 text-sm">
                                                {seriesItem.genre} • {seriesItem.type}
                                            </Text>
                                        </View>

                                        <View className="items-end mr-3">
                                            <Text className="text-gray-400 text-sm">Total Episode</Text>
                                            <Text className="text-white text-base font-medium">
                                                {seriesItem.episodes.toString().padStart(2, '0')}
                                            </Text>
                                            <Text className="text-gray-500 text-xs">
                                                {seriesItem.views} views
                                            </Text>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))
                        )}
                    </>
                )}
            </ScrollView>

            {/* Bottom Section */}
            <View className="px-4 pb-8">
                {/* Action Button */}
                <TouchableOpacity
                    className="bg-gray-200 rounded-full py-4 items-center"
                    onPress={() => {
                        if (activeTab === 'draft') {
                            goToUploadFlow();
                        } else {
                            // Go directly to series creation screen from studio
                            goToSeriesCreation();
                        }
                    }}
                >
                    <Text className="text-black text-lg font-medium">
                        {activeTab === 'draft' ? 'Upload new video' : 'Add new series'}
                    </Text>
                </TouchableOpacity>
            </View>


        </View>
    );
};

export default StrmlyStudio;