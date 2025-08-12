import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { CONFIG } from '@/Constants/config';

const AuthDebugger: React.FC = () => {
  const { token, user, isLoggedIn, logout } = useAuthStore();

  const testAPI = async () => {
    if (!token) {
      console.log('❌ No token available');
      return;
    }

    try {
      console.log('🔧 Testing API with current token...');
      const response = await fetch(`${CONFIG.API_BASE_URL}/recommendations/videos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API test successful:', data.recommendations?.length || 0, 'videos');
      } else {
        const errorText = await response.text();
        console.log('❌ API test failed:', errorText);
      }
    } catch (error) {
      console.error('❌ API test error:', error);
    }
  };

  return (
    <View style={{
      position: 'absolute',
      top: 50,
      right: 10,
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: 10,
      borderRadius: 8,
      zIndex: 1000,
      maxWidth: 200,
    }}>
      <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
        Auth Debug
      </Text>
      <Text style={{ color: 'white', fontSize: 10 }}>
        Logged In: {isLoggedIn ? '✅' : '❌'}
      </Text>
      <Text style={{ color: 'white', fontSize: 10 }}>
        Token: {token ? `${token.substring(0, 10)}...` : 'None'}
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
          borderRadius: 4,
          marginTop: 5,
        }}
      >
        <Text style={{ color: 'white', fontSize: 10 }}>Test API</Text>
      </Pressable>
      
      <Pressable
        onPress={logout}
        style={{
          backgroundColor: 'red',
          padding: 5,
          borderRadius: 4,
          marginTop: 5,
        }}
      >
        <Text style={{ color: 'white', fontSize: 10 }}>Logout</Text>
      </Pressable>
    </View>
  );
};

export default AuthDebugger;