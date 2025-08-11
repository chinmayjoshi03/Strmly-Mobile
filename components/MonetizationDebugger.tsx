import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useMonetization } from '@/app/(dashboard)/long/_components/useMonetization';
import { useAuthStore } from '@/store/useAuthStore';
import { useMonetizationStore } from '@/store/useMonetizationStore';
import { CONFIG } from '@/Constants/config';

const MonetizationDebugger: React.FC = () => {
  const { token } = useAuthStore();
  const { commentMonetizationEnabled, loading, error, refetch } = useMonetization();
  const [lastUpdate, setLastUpdate] = useState<string>('Never');
  const [updateCount, setUpdateCount] = useState(0);

  // Track when the monetization status changes
  useEffect(() => {
    setLastUpdate(new Date().toLocaleTimeString());
    setUpdateCount(prev => prev + 1);
    console.log('🔄 Monetization status changed:', { commentMonetizationEnabled, updateCount: updateCount + 1 });
  }, [commentMonetizationEnabled]);

  const testAPIDirectly = async () => {
    if (!token) {
      Alert.alert('Error', 'No authentication token found');
      return;
    }
    
    const apiUrl = `${CONFIG.API_BASE_URL}/user/monetization-status`;
    console.log('🧪 Testing API directly:', apiUrl);
    console.log('🔑 Token:', token ? 'Present' : 'Missing');
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ API Error response:', errorText);
        Alert.alert(
          'API Error',
          `Status: ${response.status}\n` +
          `URL: ${apiUrl}\n` +
          `Error: ${errorText.substring(0, 200)}`
        );
        return;
      }
      
      const data = await response.json();
      console.log('✅ API Success response:', data);
      
      Alert.alert(
        'Direct API Test - Success',
        `Status: ${response.status}\n` +
        `URL: ${apiUrl}\n` +
        `Comment Monetization: ${data.comment_monetization_status}\n` +
        `Video Monetization: ${data.video_monetization_status}\n` +
        `Message: ${data.message}`
      );
    } catch (err: any) {
      console.log('❌ Network/Parse Error:', err);
      Alert.alert(
        'Network Error', 
        `URL: ${apiUrl}\n` +
        `Error: ${err.message}\n` +
        `Check console for details`
      );
    }
  };

  const forceStoreUpdate = () => {
    const { updateMonetizationStatus } = useMonetizationStore.getState();
    updateMonetizationStatus({
      comment_monetization_status: !commentMonetizationEnabled
    });
  };

  return (
    <View style={{ 
      position: 'absolute', 
      top: 100, 
      right: 10, 
      backgroundColor: 'rgba(0,0,0,0.8)', 
      padding: 10, 
      borderRadius: 8,
      minWidth: 200,
      zIndex: 9999
    }}>
      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>
        💰 Monetization Debug
      </Text>
      
      <Text style={{ color: '#FFFFFF', fontSize: 10, marginTop: 5 }}>
        Status: {commentMonetizationEnabled ? '✅ ON' : '❌ OFF'}
      </Text>
      
      <Text style={{ color: '#FFFFFF', fontSize: 10 }}>
        Loading: {loading ? 'Yes' : 'No'}
      </Text>
      
      <Text style={{ color: '#FFFFFF', fontSize: 10 }}>
        Updates: {updateCount}
      </Text>
      
      <Text style={{ color: '#FFFFFF', fontSize: 10 }}>
        Last: {lastUpdate}
      </Text>
      
      <Text style={{ color: '#9E9E9E', fontSize: 8, marginTop: 2 }}>
        API: {CONFIG.API_BASE_URL}
      </Text>
      
      <Text style={{ color: '#9E9E9E', fontSize: 8 }}>
        Token: {token ? `${token.substring(0, 10)}...` : 'None'}
      </Text>
      
      {error && (
        <Text style={{ color: '#FF6B6B', fontSize: 9, marginTop: 2 }}>
          Error: {error}
        </Text>
      )}
      
      <View style={{ flexDirection: 'row', gap: 5, marginTop: 8 }}>
        <TouchableOpacity
          onPress={refetch}
          style={{ backgroundColor: '#007AFF', padding: 4, borderRadius: 4, flex: 1 }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 9, textAlign: 'center' }}>
            Refresh
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={testAPIDirectly}
          style={{ backgroundColor: '#28A745', padding: 4, borderRadius: 4, flex: 1 }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 9, textAlign: 'center' }}>
            Test API
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        onPress={forceStoreUpdate}
        style={{ backgroundColor: '#FF9500', padding: 4, borderRadius: 4, marginTop: 4 }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 9, textAlign: 'center' }}>
          Force Toggle (Local)
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MonetizationDebugger;