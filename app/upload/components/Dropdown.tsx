import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DropdownProps } from '../types';

/**
 * Dropdown Component
 * Reusable dropdown with overlay selection list
 * 
 * Backend Integration Notes:
 * - Options can be fetched from API endpoints
 * - Consider caching frequently used options (communities, genres)
 * - Implement search functionality for large option lists
 * 
 * API Endpoints that might be needed:
 * - GET /api/communities (for community options)
 * - GET /api/genres (for genre options)
 * - GET /api/formats (for format options)
 */
const Dropdown: React.FC<DropdownProps> = ({
  value,
  placeholder,
  options,
  onSelect,
  isOpen,
  onToggle,
  disabled = false
}) => {
  const [searchText, setSearchText] = useState('');

  // Filter options based on search text
  const filteredOptions = useMemo(() => {
    if (!searchText.trim()) return options;
    return options.filter(option => 
      option.label.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [options, searchText]);

  // Show search bar only if there are more than 5 options
  const showSearch = options.length > 5;

  return (
    <View>
      {/* Dropdown Trigger */}
      <TouchableOpacity
        onPress={disabled ? undefined : onToggle}
        className={`bg-transparent border rounded-xl px-6 py-4 flex-row items-center justify-between ${
          disabled ? 'border-gray-700 opacity-50' : 'border-gray-600'
        }`}
        style={{ minHeight: 56 }}
        disabled={disabled}
      >
        <Text className={`text-lg ${
          disabled ? 'text-gray-500' : value ? 'text-white' : 'text-gray-400'
        }`}>
          {value || placeholder}
        </Text>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={24} 
          color={disabled ? "#6B7280" : "#9CA3AF"} 
        />
      </TouchableOpacity>

      {/* Dropdown Options Modal */}
      <Modal
        visible={isOpen && !disabled}
        transparent={true}
        animationType="fade"
        onRequestClose={onToggle}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          activeOpacity={1}
          onPress={onToggle}
        >
          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
            <TouchableOpacity activeOpacity={1}>
              <View 
                style={{ 
                  backgroundColor: '#2b2b2b',
                  borderRadius: 16,
                  maxHeight: Dimensions.get('window').height * 0.6,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-500">
                  <Text className="text-white text-lg font-medium">Select Community</Text>
                  <TouchableOpacity onPress={onToggle}>
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Search Input - Only show if there are many options */}
                {showSearch && (
                  <View className="px-4 py-3 border-b border-gray-500">
                    <TextInput
                      value={searchText}
                      onChangeText={setSearchText}
                      placeholder="Search communities..."
                      placeholderTextColor="#9CA3AF"
                      className="text-white text-base bg-gray-700 rounded-lg px-3 py-2"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                )}
                
                <ScrollView 
                  showsVerticalScrollIndicator={true}
                  style={{ maxHeight: showSearch ? 300 : 400 }}
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredOptions.length === 0 ? (
                    <View className="px-6 py-8 items-center">
                      <Text className="text-gray-400 text-base">No communities found</Text>
                    </View>
                  ) : (
                    filteredOptions.map((option, index) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => {
                          onSelect(option.value);
                          setSearchText(''); // Clear search when selecting
                          onToggle(); // Close dropdown after selection
                        }}
                        className={`px-6 py-4 ${
                          index !== filteredOptions.length - 1 ? 'border-b border-gray-500' : ''
                        }`}
                        style={{ 
                          minHeight: 56,
                          backgroundColor: option.isSelected || value === option.value ? '#404040' : '#2b2b2b',
                        }}
                        activeOpacity={0.7}
                      >
                        <Text className="text-white text-lg">
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Dropdown;