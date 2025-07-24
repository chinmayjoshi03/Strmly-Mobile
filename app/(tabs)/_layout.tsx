import { Tabs } from 'expo-router';
import React from 'react';
import { View, Image } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarShowLabel: false,
        headerShown: false,
      }}>
      
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-8 h-8 items-center justify-center ${focused ? 'opacity-100' : 'opacity-60'}`}>
              <View className="w-6 h-6 border-2 border-white rounded-lg transform rotate-45" />
              <View className="w-3 h-3 bg-white rounded-full absolute" />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="studio"
        options={{
          title: 'Studio',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-8 h-8 items-center justify-center ${focused ? 'opacity-100' : 'opacity-60'}`}>
              <View className="w-6 h-6 border-2 border-white rounded-full relative">
                <View className="absolute inset-1 border border-white rounded-full" />
                <View className="absolute top-0 left-1/2 w-0.5 h-2 bg-white transform -translate-x-0.5 -translate-y-1" />
                <View className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-white transform -translate-x-0.5 translate-y-1" />
                <View className="absolute left-0 top-1/2 w-2 h-0.5 bg-white transform -translate-y-0.5 -translate-x-1" />
                <View className="absolute right-0 top-1/2 w-2 h-0.5 bg-white transform -translate-y-0.5 translate-x-1" />
              </View>
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-8 h-8 items-center justify-center ${focused ? 'opacity-100' : 'opacity-60'}`}>
              <View className="w-5 h-5 border-2 border-white rounded-full" />
              <View className="w-2 h-0.5 bg-white transform rotate-45 translate-x-2 translate-y-1" />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View className={`w-8 h-8 items-center justify-center ${focused ? 'opacity-100' : 'opacity-60'}`}>
              <View className="w-7 h-7 bg-gray-600 rounded-full overflow-hidden">
                <View className="w-full h-full bg-gradient-to-b from-gray-500 to-gray-700 items-center justify-center">
                  <View className="w-3 h-3 bg-white rounded-full mb-1" />
                  <View className="w-5 h-2 bg-white rounded-t-full" />
                </View>
              </View>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}