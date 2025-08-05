import React from 'react';
import { View, Text } from 'react-native';
import SearchScreen from '../(search)/SearchPage';

export default function SearchTab() {
  try {
    return <SearchScreen />;
  } catch (error) {
    console.error('Error in SearchTab:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
        <Text style={{ color: 'white' }}>Search temporarily unavailable</Text>
      </View>
    );
  }
}