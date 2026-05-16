import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, PlayCircle, Users, User, Library } from 'lucide-react-native';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const primaryColor = "#002147"; // KIU Navy
  const secondaryColor = "#FFD700"; // KIU Gold

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color, focused }) => (
            <LayoutDashboard size={focused ? 24 : 22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="tutorials"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <PlayCircle size={focused ? 24 : 22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <Library size={focused ? 24 : 22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Lounge',
          tabBarIcon: ({ color, focused }) => (
            <Users size={focused ? 24 : 22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarIcon: ({ color, focused }) => (
            <User size={focused ? 24 : 22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      {/* Hiding default tabs if they exist */}
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
