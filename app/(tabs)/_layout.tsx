import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LayoutDashboard, PlayCircle, Users, User, TrendingUp } from 'lucide-react-native';
import { useColorScheme } from '@/components/useColorScheme';

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.container}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];

        // This checks if href is explicitly set to null to hide the tab,
        // and explicitly blocks the "resources" and "two" screens from rendering in the nav bar.
        if (options.href === null || route.name === 'resources' || route.name === 'two') {
          return null;
        }

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
              {options.tabBarIcon && options.tabBarIcon({
                focused: isFocused,
                color: isFocused ? '#002147' : '#94A3B8',
                size: 22
              })}
            </View>
            <Text style={[styles.label, isFocused && styles.labelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const primaryColor = "#002147"; // KIU Navy
  const secondaryColor = "#FFD700"; // KIU Gold

  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
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
          title: 'Tutorials',
          tabBarIcon: ({ color, focused }) => (
            <PlayCircle size={focused ? 24 : 22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <TrendingUp size={focused ? 24 : 22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Social',
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

      {/* Add the screens you want to hide below and set href: null.
        Replace 'hidden-screen-1' with the exact file/folder names that you want to hide.
      */}
      <Tabs.Screen
        name="resources"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.92)', // Semi-transparent for glass effect
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
    paddingBottom: Platform.OS === 'ios' ? 40 : 32, 
    paddingTop: 24, 
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 0, // Remove solid android shadows for glass feel
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6, // Added more space between icon and text
  },
  iconWrapperActive: {
    backgroundColor: '#FFD70020',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: '#002147',
  },
});