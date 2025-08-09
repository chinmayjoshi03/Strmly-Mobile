import React, { useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FormField from '../components/FormField';
import Dropdown from '../components/Dropdown';
import ContinueButton from '../components/ContinueButton';
import { VideoDetailProps } from '../types';
import { formatOptions, videoTypeOptions } from '../data/dropdownOptions';
import { useCommunities } from '../hooks/useCommunities';

/**
 * Video Detail Screen
 * Multi-step form for video metadata configuration
 * 
 * Backend Integration Notes:
 * - Form data should be validated on both client and server
 * - Consider auto-saving drafts as user types
 * - Implement proper error handling for API failures
 * - Add loading states for dropdown data fetching
 * 
 * API Endpoints:
 * - GET /api/communities (for community dropdown)
 * - GET /api/formats (for format dropdown)
 * - POST /api/videos/draft (for saving draft data)
 */
const VideoDetailScreen: React.FC<VideoDetailProps> = ({
  step,
  formData,
  onFormChange,
  onContinue,
  onBack,
  selectedSeries,
 
  videoFormat,
  isEditingDraft
}) => {
  const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false);
  const [formatDropdownOpen, setFormatDropdownOpen] = useState(false);
  const [videoTypeDropdownOpen, setVideoTypeDropdownOpen] = useState(false);
  
  // Fetch communities dynamically
  const { communities: communityOptions, loading: communitiesLoading, error: communitiesError } = useCommunities();

  // Handle title change
  const handleTitleChange = (title: string) => {
    onFormChange({ ...formData, title });
  };

  // Handle community selection
  const handleCommunitySelect = (community: string) => {
    onFormChange({ ...formData, community });
    setCommunityDropdownOpen(false);
  };

  // Handle format selection
  const handleFormatSelect = (format: string) => {
    onFormChange({ ...formData, format: format as 'Netflix' | 'Youtube' });
    setFormatDropdownOpen(false);
  };

  // Handle video type selection
  const handleVideoTypeSelect = (videoType: string) => {
    onFormChange({ ...formData, videoType: videoType as 'free' | 'paid' });
    setVideoTypeDropdownOpen(false);
  };

  // Check if current step is valid
  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.title.trim() !== '' && formData.community !== null;
      case 2:
        return formData.title.trim() !== '' &&
          formData.community !== null &&
          formData.format !== null;
      case 3:
        const basicValidation = formData.title.trim() !== '' &&
          formData.community !== null &&
          formData.format !== null &&
          formData.videoType !== null;
        
        // Additional validation for paid videos
        if (formData.videoType === 'paid') {
          const hasValidAmount = formData.amount && formData.amount > 0;
          console.log('💰 Paid video validation - amount:', formData.amount, 'isValid:', hasValidAmount);
          return basicValidation && hasValidAmount;
        }
        
        return basicValidation;
      default:
        return false;
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 mt-12">
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-medium">
          {isEditingDraft ? 'Edit Draft' : 'Video detail'}
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Series Information - Hidden since series is already selected in previous step */}

        {/* Title Field */}
        <FormField
          label={videoFormat === 'episode' ? 'Episode Title' : 'Title'}
          value={formData.title}
          placeholder={videoFormat === 'episode' ? 'Episode 1' : 'Bank name'}
          onChangeText={handleTitleChange}
        />

        {/* Community Dropdown */}
        <View className="mb-8">
          <Text className="text-white text-lg font-medium mb-3">Community</Text>
          {communitiesLoading ? (
            <View className="bg-gray-800 rounded-lg p-4 flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#fff" />
              <Text className="text-white ml-2">Loading communities...</Text>
            </View>
          ) : communitiesError ? (
            <View className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <Text className="text-red-400 text-sm">Failed to load communities</Text>
              <Text className="text-gray-400 text-xs mt-1">Using fallback options</Text>
            </View>
          ) : null}
          <Dropdown
            value={formData.community ? communityOptions.find(option => option.value === formData.community)?.label || formData.community : null}
            placeholder="Select"
            options={communityOptions}
            onSelect={handleCommunitySelect}
            isOpen={communityDropdownOpen}
            onToggle={() => setCommunityDropdownOpen(!communityDropdownOpen)}
            disabled={communitiesLoading}
          />
        </View>

        {/* Format Dropdown - Show from step 2 onwards */}
        {step >= 2 && (
          <View className="mb-8">
            <Text className="text-white text-lg font-medium mb-3">Format That Fits Your Content</Text>
            <Dropdown
              value={formData.format}
              placeholder="Select"
              options={formatOptions}
              onSelect={handleFormatSelect}
              isOpen={formatDropdownOpen}
              onToggle={() => setFormatDropdownOpen(!formatDropdownOpen)}
            />
          </View>
        )}

        {/* Video Type Dropdown - Show from step 3 onwards */}
        {step >= 3 && (
          <View className="mb-8">
            <Text className="text-white text-lg font-medium mb-3">Video Type</Text>
            <Dropdown
              value={formData.videoType}
              placeholder="Select"
              options={videoTypeOptions}
              onSelect={handleVideoTypeSelect}
              isOpen={videoTypeDropdownOpen}
              onToggle={() => setVideoTypeDropdownOpen(!videoTypeDropdownOpen)}
            />
            
            {/* Price Input - Show only when Paid is selected */}
            {formData.videoType === 'paid' && (
              <View className="mt-4">
                <FormField
                  label="Price (₹)"
                  value={formData.amount?.toString() || ''}
                  placeholder="Enter price (e.g., 10)"
                  onChangeText={(text) => {
                    let amount: number | undefined;
                    if (text.trim() === '') {
                      amount = undefined;
                    } else {
                      const parsed = parseFloat(text);
                      amount = isNaN(parsed) ? undefined : parsed;
                    }
                    console.log('💰 Price input changed:', text, '-> amount:', amount, 'isValid:', amount && amount > 0);
                    onFormChange({ ...formData, amount });
                  }}
                  keyboardType="numeric"
                  error={formData.videoType === 'paid' && (!formData.amount || formData.amount <= 0) ? 'Price must be greater than 0' : undefined}
                />
              </View>
            )}
          </View>
        )}

        {/* Add some bottom padding for better scrolling */}
        <View className="h-20" />
      </ScrollView>

      {/* Continue Button */}
      <View style={{ marginBottom: 80 }}>
        <ContinueButton
          title={formData.videoType === 'paid' && (!formData.amount || formData.amount <= 0) ? 'Enter Price to Continue' : 'Continue'}
          onPress={onContinue}
          disabled={!isStepValid()}
        />
      </View>
    </View>
  );
};

export default VideoDetailScreen;