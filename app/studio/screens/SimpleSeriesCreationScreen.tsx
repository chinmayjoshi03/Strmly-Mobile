import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StatusBar, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Series } from '../types';

interface SimpleSeriesCreationScreenProps {
  onBack: () => void;
  onSeriesCreated: (series: Series) => void;
}

/**
 * Simple Series Creation Screen
 * Simplified version without useSeriesManagement hook to test duplicate screen issue
 */
const SimpleSeriesCreationScreen: React.FC<SimpleSeriesCreationScreenProps> = ({
  onBack,
  onSeriesCreated
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'free' | 'paid' | null>(null);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClose = () => {
    onBack();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Series title is required';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Series title must be 100 characters or less';
    }

    if (!type) {
      newErrors.type = 'Series type is required';
    }

    if (type === 'paid') {
      if (!price || price <= 0) {
        newErrors.price = 'Price must be greater than 0 for paid series';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newSeries: Series = {
        id: Date.now().toString(),
        title: title.trim(),
        description: '',
        totalEpisodes: 0,
        accessType: type!,
        price: type === 'paid' ? price : undefined,
        launchDate: new Date().toISOString(),
        totalViews: 0,
        totalEarnings: 0,
        episodes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setLoading(false);
      onSeriesCreated(newSeries);
    }, 1000);
  };

  const handleTypeSelect = (selectedType: 'free' | 'paid') => {
    setType(selectedType);
    setPrice(selectedType === 'free' ? undefined : price);
    setShowTypeDropdown(false);
  };

  const getTypeDisplayText = () => {
    if (!type) return 'Select';
    return type === 'free' ? 'Free' : 'Paid';
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 bg-black">
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 mt-12">
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1 px-4 pt-16" showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View className="items-center mb-12">
            <Text className="text-white text-xl font-medium mb-8">Give your series name</Text>
            
            {/* Series Name Input */}
            <View className="w-full max-w-xs">
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Series 1"
                placeholderTextColor="#9CA3AF"
                className="text-white text-2xl font-medium text-center border-b border-gray-600 pb-2 mb-2"
                maxLength={100}
                autoFocus
              />
              {errors.title && (
                <Text className="text-red-400 text-sm text-center mt-2">{errors.title}</Text>
              )}
            </View>
          </View>

          {/* Type Selection */}
          <View className="mb-8">
            <Text className="text-white text-base font-medium mb-4">Type</Text>
            
            {/* Type Dropdown */}
            <TouchableOpacity
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
              className="bg-gray-800 border border-gray-600 rounded-xl px-4 py-4 flex-row items-center justify-between"
            >
              <Text className={`text-base ${type ? 'text-white' : 'text-gray-400'}`}>
                {getTypeDisplayText()}
              </Text>
              <Ionicons 
                name={showTypeDropdown ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#9CA3AF" 
              />
            </TouchableOpacity>

            {/* Dropdown Options */}
            {showTypeDropdown && (
              <View className="bg-gray-800 border border-gray-600 rounded-xl mt-2 overflow-hidden">
                <TouchableOpacity
                  onPress={() => handleTypeSelect('free')}
                  className="px-4 py-4 border-b border-gray-600"
                >
                  <Text className="text-white text-base">Free</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleTypeSelect('paid')}
                  className="px-4 py-4"
                >
                  <Text className="text-white text-base">Paid</Text>
                </TouchableOpacity>
              </View>
            )}

            {errors.type && (
              <Text className="text-red-400 text-sm mt-2">{errors.type}</Text>
            )}
          </View>

          {/* Price Input - Only show for paid series */}
          {type === 'paid' && (
            <View className="mb-8">
              <Text className="text-white text-base font-medium mb-4">Price</Text>
              <TextInput
                value={price?.toString() || ''}
                onChangeText={(priceText) => setPrice(priceText ? parseInt(priceText) : undefined)}
                placeholder="₹30"
                placeholderTextColor="#9CA3AF"
                className="bg-gray-800 border border-gray-600 text-white px-4 py-4 rounded-xl text-base"
                keyboardType="numeric"
              />
              {errors.price && (
                <Text className="text-red-400 text-sm mt-2">{errors.price}</Text>
              )}
            </View>
          )}

          {/* General Error */}
          {errors.general && (
            <View className="mb-6">
              <Text className="text-red-400 text-sm text-center">{errors.general}</Text>
            </View>
          )}
        </ScrollView>

        {/* Create Button */}
        <View className="px-4 pb-8 pt-4">
          <TouchableOpacity
            onPress={handleCreate}
            disabled={loading}
            className="bg-gray-200 rounded-full py-4 items-center"
            style={{
              backgroundColor: loading ? '#6B7280' : '#E5E7EB'
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="black" />
            ) : (
              <Text className="text-black text-lg font-medium">Create</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SimpleSeriesCreationScreen;