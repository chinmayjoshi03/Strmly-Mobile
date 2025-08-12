import React, { useState, useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';
import { TimePickerProps } from '../types';

/**
 * TimePicker Component
 * Dual input fields for minutes and seconds selection
 * 
 * Backend Integration Notes:
 * - Time values are stored as separate minutes and seconds
 * - Convert to total seconds when sending to backend: (minutes * 60) + seconds
 * - Validate time ranges on both frontend and backend
 * - Consider maximum video length limits
 */
const TimePicker: React.FC<TimePickerProps> = ({
  minutes,
  seconds,
  onMinutesChange,
  onSecondsChange
}) => {
  // Local state for input values to handle typing better
  const [minutesText, setMinutesText] = useState(minutes.toString());
  const [secondsText, setSecondsText] = useState(seconds.toString());

  // Update local state when props change
  useEffect(() => {
    setMinutesText(minutes.toString());
  }, [minutes]);

  useEffect(() => {
    setSecondsText(seconds.toString());
  }, [seconds]);

  // Handle minutes input change with validation
  const handleMinutesChange = (text: string) => {
    setMinutesText(text);
    
    // Allow empty string
    if (text === '') {
      onMinutesChange(0);
      return;
    }
    
    const numValue = parseInt(text, 10);
    // Only update if it's a valid number and within range
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 999) {
      onMinutesChange(numValue);
    }
  };

  // Handle seconds input change with validation
  const handleSecondsChange = (text: string) => {
    setSecondsText(text);
    
    // Allow empty string
    if (text === '') {
      onSecondsChange(0);
      return;
    }
    
    const numValue = parseInt(text, 10);
    
    // Only update if it's a valid number and within range
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 59) {
      onSecondsChange(numValue);
    }
  };

  return (
    <View className="flex-row items-center space-x-4">
      {/* Minutes Input */}
      <View className="flex-row items-center">
        <TextInput
          value={minutesText}
          onChangeText={handleMinutesChange}
          onBlur={() => {
            // Ensure we have a valid display value on blur
            if (minutesText === '' || isNaN(parseInt(minutesText, 10))) {
              setMinutesText('0');
            }
          }}
          keyboardType="numeric"
          maxLength={3}
          placeholder="00"
          placeholderTextColor="#6B7280"
          selectTextOnFocus={true}
          className="bg-transparent border border-gray-600 rounded-lg px-3 py-2 text-white text-base text-center w-16"
        />
        <Text className="text-gray-400 text-base ml-2">min</Text>
      </View>

      {/* Seconds Input */}
      <View className="flex-row items-center">
        <TextInput
          value={secondsText}
          onChangeText={handleSecondsChange}
          onBlur={() => {
            // Ensure we have a valid display value on blur
            if (secondsText === '' || isNaN(parseInt(secondsText, 10))) {
              setSecondsText('0');
            }
          }}
          keyboardType="numeric"
          maxLength={2}
          placeholder="00"
          placeholderTextColor="#6B7280"
          selectTextOnFocus={true}
          className="bg-transparent border border-gray-600 rounded-lg px-3 py-2 text-white text-base text-center w-16"
        />
        <Text className="text-gray-400 text-base ml-2">sec</Text>
      </View>
    </View>
  );
};

export default TimePicker;