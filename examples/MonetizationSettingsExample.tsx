import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { useMonetization } from '@/app/(dashboard)/long/_components/useMonetization';
import { useAuthStore } from '@/store/useAuthStore';
import { refreshMonetizationStatus, updateMonetizationStatus } from '@/utils/monetizationUtils';

/**
 * Example component showing how to integrate monetization settings
 * with real-time updates in the comment section
 */
const MonetizationSettingsExample: React.FC = () => {
  const { token } = useAuthStore();
  const { commentMonetizationEnabled, videoMonetizationEnabled, loading } = useMonetization();
  const [saving, setSaving] = useState(false);

  const updateCommentMonetization = async (enabled: boolean) => {
    if (!token) return;

    setSaving(true);
    
    try {
      // 1. Optimistically update the UI immediately
      updateMonetizationStatus({
        comment_monetization_status: enabled
      });

      // 2. Make API call to update the setting on the server
      const response = await fetch('http://localhost:8080/api/v1/user/monetization-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_monetization_enabled: enabled
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update monetization settings');
      }

      // 3. Refresh the status from the server to ensure consistency
      await refreshMonetizationStatus(token);

      Alert.alert(
        'Success',
        `Comment monetization ${enabled ? 'enabled' : 'disabled'}. Changes will be visible immediately in the comment section.`
      );

    } catch (error) {
      console.error('Failed to update monetization settings:', error);
      
      // Revert the optimistic update on error
      updateMonetizationStatus({
        comment_monetization_status: !enabled
      });

      Alert.alert('Error', 'Failed to update monetization settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ padding: 20, backgroundColor: '#1a1a1a', margin: 10, borderRadius: 8 }}>
      <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        💰 Monetization Settings
      </Text>

      {/* Comment Monetization Setting */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
            Comment Monetization
          </Text>
          <Text style={{ color: '#9E9E9E', fontSize: 14, marginTop: 4 }}>
            Allow users to tip your comments
          </Text>
        </View>
        <Switch
          value={commentMonetizationEnabled}
          onValueChange={updateCommentMonetization}
          disabled={saving || loading}
          trackColor={{ false: '#767577', true: '#4CAF50' }}
          thumbColor={commentMonetizationEnabled ? '#FFFFFF' : '#f4f3f4'}
        />
      </View>

      {/* Video Monetization Setting */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingVertical: 15,
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
            Video Monetization
          </Text>
          <Text style={{ color: '#9E9E9E', fontSize: 14, marginTop: 4 }}>
            Enable monetization for your videos
          </Text>
        </View>
        <Switch
          value={videoMonetizationEnabled}
          onValueChange={(enabled) => {
            // Similar implementation for video monetization
            console.log('Video monetization:', enabled);
          }}
          disabled={saving || loading}
          trackColor={{ false: '#767577', true: '#4CAF50' }}
          thumbColor={videoMonetizationEnabled ? '#FFFFFF' : '#f4f3f4'}
        />
      </View>

      {/* Status Indicator */}
      <View style={{ 
        marginTop: 20, 
        padding: 15, 
        backgroundColor: '#2a2a2a', 
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: commentMonetizationEnabled ? '#4CAF50' : '#F44336'
      }}>
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
          Current Status
        </Text>
        <Text style={{ color: '#9E9E9E', fontSize: 12, marginTop: 5 }}>
          {commentMonetizationEnabled 
            ? '✅ Rupee icons are visible in comments' 
            : '❌ Rupee icons are hidden in comments'
          }
        </Text>
        <Text style={{ color: '#9E9E9E', fontSize: 12 }}>
          Changes take effect immediately without app restart
        </Text>
      </View>

      {saving && (
        <View style={{ marginTop: 15, alignItems: 'center' }}>
          <Text style={{ color: '#FFD24D', fontSize: 14 }}>
            💾 Saving changes...
          </Text>
        </View>
      )}
    </View>
  );
};

export default MonetizationSettingsExample;