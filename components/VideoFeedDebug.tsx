import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { CONFIG } from '@/Constants/config';

const VideoFeedDebug: React.FC = () => {
  const { token, user, isLoggedIn } = useAuthStore();

  const testAPI = async () => {
    try {
      console.log('🔧 Testing API from debug component...');
      
      if (!token) {
        Alert.alert('Debug', 'No token found - user not logged in');
        return;
      }

      const response = await fetch(`${CONFIG.API_BASE_URL}/videos/trending?page=1&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      Alert.alert(
        'API Test Result',
        `Status: ${response.status}\nVideos: ${result.data?.length || 0}\nMessage: ${result.message || 'No message'}`
      );
    } catch (error: any) {
      Alert.alert('API Test Error', error.message);
    }
  };

  return (
    <View style={{ 
      position: 'absolute', 
      top: 50, 
      right: 10, 
      backgroundColor: 'rgba(0,0,0,0.8)', 
      padding: 10, 
      borderRadius: 5,
      zIndex: 1000
    }}>
      <Text style={{ color: 'white', fontSize: 12, marginBottom: 5 }}>
        Debug Info:
      </Text>
      <Text style={{ color: 'white', fontSize: 10 }}>
        Logged In: {isLoggedIn ? '✅' : '❌'}
      </Text>
      <Text style={{ color: 'white', fontSize: 10 }}>
        Token: {token ? '✅' : '❌'} ({token?.length || 0} chars)
      </Text>
      <Text style={{ color: 'white', fontSize: 10 }}>
        User: {user?.username || 'None'}
      </Text>
      <Text style={{ color: 'white', fontSize: 10 }}>
        API: {CONFIG.API_BASE_URL}
      </Text>
      
      <Pressable
        onPress={testAPI}
        style={{
          backgroundColor: 'blue',
          padding: 5,
          borderRadius: 3,
          marginTop: 5
        }}
      >
        <Text style={{ color: 'white', fontSize: 10 }}>Test API</Text>
      </Pressable>
    </View>
  );
};

export default VideoFeedDebug;