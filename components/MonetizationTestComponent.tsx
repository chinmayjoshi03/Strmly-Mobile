import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useMonetization } from '@/app/(dashboard)/long/_components/useMonetization';
import { useAuthStore } from '@/store/useAuthStore';
import { refreshMonetizationStatus, updateMonetizationStatus } from '@/utils/monetizationUtils';

const MonetizationTestComponent: React.FC = () => {
  const { 
    monetizationStatus, 
    commentMonetizationEnabled, 
    videoMonetizationEnabled, 
    loading, 
    error 
  } = useMonetization();
  const { token } = useAuthStore();

  const showStatus = () => {
    Alert.alert(
      'Monetization Status',
      `Comment Monetization: ${commentMonetizationEnabled ? 'ENABLED' : 'DISABLED'}\n` +
      `Video Monetization: ${videoMonetizationEnabled ? 'ENABLED' : 'DISABLED'}\n` +
      `Loading: ${loading}\n` +
      `Error: ${error || 'None'}\n` +
      `Token: ${token ? 'Present' : 'Missing'}`
    );
  };

  const handleRefresh = async () => {
    if (token) {
      await refreshMonetizationStatus(token);
    }
  };

  const toggleCommentMonetization = () => {
    // Simulate toggling comment monetization (for testing)
    updateMonetizationStatus({
      comment_monetization_status: !commentMonetizationEnabled
    });
  };

  if (loading) {
    return (
      <View style={{ padding: 20, backgroundColor: '#1a1a1a', margin: 10, borderRadius: 8 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>
          🔄 Loading Monetization Status...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20, backgroundColor: '#1a1a1a', margin: 10, borderRadius: 8 }}>
      <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        💰 Monetization Status Test
      </Text>
      
      <View style={{ marginBottom: 10 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 14 }}>
          Comment Monetization: {' '}
          <Text style={{ color: commentMonetizationEnabled ? '#4CAF50' : '#F44336' }}>
            {commentMonetizationEnabled ? '✅ ENABLED' : '❌ DISABLED'}
          </Text>
        </Text>
      </View>

      <View style={{ marginBottom: 10 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 14 }}>
          Video Monetization: {' '}
          <Text style={{ color: videoMonetizationEnabled ? '#4CAF50' : '#F44336' }}>
            {videoMonetizationEnabled ? '✅ ENABLED' : '❌ DISABLED'}
          </Text>
        </Text>
      </View>

      {error && (
        <View style={{ marginBottom: 10 }}>
          <Text style={{ color: '#F44336', fontSize: 12 }}>
            Error: {error}
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <TouchableOpacity
          onPress={showStatus}
          style={{
            backgroundColor: '#007AFF',
            padding: 10,
            borderRadius: 6,
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
            Show Status
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRefresh}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#666' : '#28A745',
            padding: 10,
            borderRadius: 6,
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
            {loading ? 'Loading...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={toggleCommentMonetization}
        style={{
          backgroundColor: '#FF9500',
          padding: 10,
          borderRadius: 6,
          alignItems: 'center',
          marginTop: 10,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
          Toggle Comment Monetization (Test)
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 15, padding: 10, backgroundColor: '#2a2a2a', borderRadius: 6 }}>
        <Text style={{ color: '#9E9E9E', fontSize: 12, fontWeight: 'bold' }}>
          Real-time Updates:
        </Text>
        <Text style={{ color: '#9E9E9E', fontSize: 11, marginTop: 5 }}>
          • Status updates automatically when app comes to foreground
        </Text>
        <Text style={{ color: '#9E9E9E', fontSize: 11 }}>
          • Changes reflect immediately without app reload
        </Text>
        <Text style={{ color: '#9E9E9E', fontSize: 11 }}>
          • Use "Refresh" button to manually update status
        </Text>
        <Text style={{ color: '#9E9E9E', fontSize: 11 }}>
          • "Toggle" button simulates local status changes
        </Text>
      </View>
    </View>
  );
};

export default MonetizationTestComponent;