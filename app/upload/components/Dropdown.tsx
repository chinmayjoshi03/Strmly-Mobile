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
  onToggle,
  disabled = false
}) => {
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

      {/* Dropdown Options Overlay */}
      {isOpen && !disabled && (
        <View 
          className="absolute top-20 left-0 right-0 border border-gray-500 z-10 max-h-64"
          style={{ 
            backgroundColor: '#2b2b2b',
            borderRadius: 16
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  onSelect(option.value);
                  onToggle(); // Close dropdown after selection
                }}
                className={`px-6 py-4 ${
                  index !== options.length - 1 ? 'border-b border-gray-500' : ''
                }`}
                style={{ 
                  minHeight: 56,
                  backgroundColor: option.isSelected || value === option.value ? '#404040' : '#2b2b2b',
                  borderTopLeftRadius: index === 0 ? 16 : 0,
                  borderTopRightRadius: index === 0 ? 16 : 0,
                  borderBottomLeftRadius: index === options.length - 1 ? 16 : 0,
                  borderBottomRightRadius: index === options.length - 1 ? 16 : 0,
                }}
              >
                <Text className="text-white text-lg">
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