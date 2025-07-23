import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface FormFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  error?: string;
}

/**
 * Reusable form field component for text inputs
 * Used across video upload forms for consistent styling
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  placeholder,
  onChangeText,
  error
}) => {
  return (
    <View className="mb-6">
      <Text className="text-white text-base mb-2">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#666666"
        className={`bg-transparent border rounded-lg px-4 py-3 text-white text-base ${
          error ? 'border-red-500' : 'border-gray-600'
        }`}
      />
      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
};

export default FormField;