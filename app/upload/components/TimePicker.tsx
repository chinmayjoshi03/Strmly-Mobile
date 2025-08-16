import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Animated } from 'react-native';
import { TimePickerProps } from '../types';

/**
 * TimePicker Component
 * Dual input fields for minutes and seconds selection with auto-conversion
 * 
 * Features:
 * - Auto-converts seconds > 59 to minutes and remaining seconds
 * - Example: Input 75 seconds → 1 min 15 sec
 * - Real-time validation and conversion
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
  
  // Animation for conversion feedback
  const [conversionOpacity] = useState(new Animated.Value(0));
  const [showConversionFeedback, setShowConversionFeedback] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setMinutesText(minutes.toString());
  }, [minutes]);

  useEffect(() => {
    setSecondsText(seconds.toString());
  }, [seconds]);

  // Animation function for conversion feedback
  const showConversionAnimation = () => {
    setShowConversionFeedback(true);
    
    Animated.sequence([
      Animated.timing(conversionOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(conversionOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowConversionFeedback(false);
    });
  };

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

  // Handle seconds input change with validation and auto-conversion
  const handleSecondsChange = (text: string) => {
    setSecondsText(text);
    
    // Allow empty string
    if (text === '') {
      onSecondsChange(0);
      return;
    }
    
    const numValue = parseInt(text, 10);
    
    // Only proceed if it's a valid number and non-negative
    if (!isNaN(numValue) && numValue >= 0) {
      // Prevent extremely large values (max 9999 seconds = ~166 minutes)
      if (numValue > 9999) {
        console.warn('⚠️ Seconds value too large, ignoring input');
        return;
      }
      
      if (numValue <= 59) {
        // Normal case: seconds within valid range
        onSecondsChange(numValue);
      } else {
        // Auto-conversion case: seconds > 59
        const additionalMinutes = Math.floor(numValue / 60);
        const remainingSeconds = numValue % 60;
        const newMinutes = minutes + additionalMinutes;
        
        // Prevent minutes from exceeding reasonable limits (max 999 minutes)
        if (newMinutes > 999) {
          console.warn('⚠️ Total minutes would exceed limit, ignoring input');
          return;
        }
        
        // Update both minutes and seconds
        onMinutesChange(newMinutes);
        onSecondsChange(remainingSeconds);
        
        // Update local text states to reflect the conversion
        setMinutesText(newMinutes.toString());
        setSecondsText(remainingSeconds.toString());
        
        // Show conversion feedback
        showConversionAnimation();
        
        console.log(`🕐 Auto-converted ${numValue} seconds to ${additionalMinutes} min ${remainingSeconds} sec`);
      }
    }
  };

  return (
    <View>
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
          maxLength={4}
          placeholder="00"
          placeholderTextColor="#6B7280"
          selectTextOnFocus={true}
          className="bg-transparent border border-gray-600 rounded-lg px-3 py-2 text-white text-base text-center w-16"
        />
        <Text className="text-gray-400 text-base ml-2">sec</Text>
      </View>
      </View>

      {/* Conversion Feedback */}
      {showConversionFeedback && (
        <Animated.View 
          style={{ opacity: conversionOpacity }}
          className="mt-2 bg-blue-900/20 border border-blue-500/30 rounded-lg px-3 py-2"
        >
          <Text className="text-blue-300 text-xs text-center">
            ✨ Auto-converted to minutes and seconds
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

export default TimePicker;