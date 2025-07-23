import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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
  onToggle
}) => {
  return (
    <View className="mb-6">
      {/* Dropdown Trigger */}
      <TouchableOpacity
        onPress={onToggle}
        className="bg-transparent border border-gray-600 rounded-lg px-4 py-3 flex-row items-center justify-between"
      >
        <Text className={`text-base ${value ? 'text-white' : 'text-gray-400'}`}>
          {value || placeholder}
        </Text>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#9CA3AF" 
        />
      </TouchableOpacity>

      {/* Dropdown Options Overlay */}
      {isOpen && (
        <View className="absolute top-14 left-0 right-0 bg-gray-800 rounded-lg border border-gray-600 z-10 max-h-48">
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  onSelect(option.value);
                  onToggle(); // Close dropdown after selection
                }}
                className={`px-4 py-3 ${
                  index !== options.length - 1 ? 'border-b border-gray-700' : ''
                } ${
                  option.isSelected || value === option.value 
                    ? 'bg-gray-700' 
                    : 'bg-gray-800'
                }`}
              >
                <Text className="text-white text-base">
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default Dropdown;