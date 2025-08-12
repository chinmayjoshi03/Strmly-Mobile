import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { CONFIG } from '@/Constants/config';

const NetworkDiagnostic: React.FC = () => {
  const { token } = useAuthStore();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log('🔍', message);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testBasicConnectivity = async () => {
    addResult('🔍 Testing basic connectivity...');
    
    try {
      // Test 1: Basic fetch to a known endpoint
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        addResult('✅ Internet connectivity: OK');
      } else {
        addResult(`❌ Internet connectivity: Failed (${response.status})`);
      }
    } catch (error: any) {
      addResult(`❌ Internet connectivity: Error - ${error.message}`);
    }
  };

  const testBackendConnectivity = async () => {
    addResult('🔍 Testing backend connectivity...');
    
    try {
      // Test 2: Backend base URL
      const baseUrl = CONFIG.API_BASE_URL.replace('/api/v1', '');
      addResult(`📡 Testing: ${baseUrl}`);
      
      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      addResult(`📡 Backend response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        addResult('✅ Backend connectivity: OK');
      } else {
        addResult(`⚠️ Backend connectivity: Status ${response.status}`);
      }
    } catch (error: any) {
      addResult(`❌ Backend connectivity: Error - ${error.message}`);
    }
  };

  const testAuthEndpoint = async () => {
    if (!token) {
      addResult('❌ No auth token available');
      return;
    }

    addResult('🔍 Testing auth endpoint...');
    
    try {
      // Test 3: A simple authenticated endpoint
      const url = `${CONFIG.API_BASE_URL}/user/profile`;
      addResult(`📡 Testing: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      addResult(`📡 Auth endpoint response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        addResult('✅ Authentication: OK');
      } else if (response.status === 401) {
        addResult('❌ Authentication: Token invalid/expired');
      } else {
        addResult(`⚠️ Authentication: Status ${response.status}`);
      }
    } catch (error: any) {
      addResult(`❌ Auth endpoint: Error - ${error.message}`);
    }
  };

  const testMonetizationEndpoint = async () => {
    if (!token) {
      addResult('❌ No auth token for monetization test');
      return;
    }

    addResult('🔍 Testing monetization endpoint...');
    
    try {
      const url = `${CONFIG.API_BASE_URL}/user/monetization-status`;
      addResult(`📡 Testing: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      addResult(`📡 Monetization response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        addResult('✅ Monetization endpoint: OK');
        addResult(`📊 Comment monetization: ${data.comment_monetization_status}`);
        addResult(`📊 Video monetization: ${data.video_monetization_status}`);
      } else {
        const errorText = await response.text();
        addResult(`❌ Monetization endpoint: ${response.status}`);
        addResult(`📄 Error: ${errorText.substring(0, 100)}`);
      }
    } catch (error: any) {
      addResult(`❌ Monetization endpoint: Error - ${error.message}`);
    }
  };

  const runAllTests = async () => {
    clearResults();
    addResult('🚀 Starting network diagnostics...');
    addResult(`🔧 API Base URL: ${CONFIG.API_BASE_URL}`);
    addResult(`🔑 Token: ${token ? 'Present' : 'Missing'}`);
    
    await testBasicConnectivity();
    await testBackendConnectivity();
    await testAuthEndpoint();
    await testMonetizationEndpoint();
    
    addResult('✅ Diagnostics complete');
  };

  return (
    <View style={{ 
      position: 'absolute', 
      top: 50, 
      left: 10, 
      right: 10, 
      backgroundColor: 'rgba(0,0,0,0.9)', 
      padding: 15, 
      borderRadius: 8,
      maxHeight: 400,
      zIndex: 9999
    }}>
      <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>
        🔍 Network Diagnostics
      </Text>
      
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
        <TouchableOpacity
          onPress={runAllTests}
          style={{ backgroundColor: '#007AFF', padding: 8, borderRadius: 4, flex: 1 }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 12, textAlign: 'center' }}>
            Run All Tests
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={clearResults}
          style={{ backgroundColor: '#FF3B30', padding: 8, borderRadius: 4, flex: 1 }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 12, textAlign: 'center' }}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={{ maxHeight: 250 }}>
        {testResults.map((result, index) => (
          <Text key={index} style={{ 
            color: result.includes('❌') ? '#FF6B6B' : 
                  result.includes('✅') ? '#4CAF50' : 
                  result.includes('⚠️') ? '#FFD24D' : '#FFFFFF',
            fontSize: 10,
            marginBottom: 2,
            fontFamily: 'monospace'
          }}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

export default NetworkDiagnostic;