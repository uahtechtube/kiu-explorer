import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LayoutDashboard, PlayCircle, Users, User, TrendingUp } from 'lucide-react-native';
import { useColorScheme } from '@/components/useColorScheme';

import { Animated } from 'react-native';

function TabButton({ route, options, isFocused, onPress, label, isCenter }: any) {
  const scale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: isFocused ? 1.15 : 1.0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [isFocused]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarTestID}
      onPress={onPress}
      style={styles.tab}
      activeOpacity={0.7}
    >
      <Animated.View style={[
        isCenter ? styles.centerIconWrapper : styles.iconWrapper,
        isCenter ? (isFocused && styles.centerIconWrapperActive) : (isFocused && styles.iconWrapperActive),
        { transform: [{ scale }] }
      ]}>
        {options.tabBarIcon && options.tabBarIcon({
          focused: isFocused,
          color: isCenter ? (isFocused ? '#002147' : '#FFFFFF') : (isFocused ? '#002147' : '#94A3B8'),
          size: isCenter ? 24 : 22
        })}
      </Animated.View>
      <Text style={[styles.label, isFocused && styles.labelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.container}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];

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
        const isCenter = route.name === 'progress';

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
          <TabButton
            key={route.key}
            route={route}
            options={options}
            isFocused={isFocused}
            onPress={onPress}
            label={label}
            isCenter={isCenter}
          />
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
            <TrendingUp size={focused ? 28 : 26} color={color} strokeWidth={focused ? 2.8 : 2.2} />
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
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    paddingBottom: Platform.OS === 'ios' ? 34 : 28, 
    paddingTop: 12, 
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
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
    marginBottom: 4,
  },
  iconWrapperActive: {
    backgroundColor: '#FFD70020',
  },
  centerIconWrapper: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#002147',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginBottom: 4,
  },
  centerIconWrapperActive: {
    backgroundColor: '#FFD700',
  },
  label: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: '#002147',
  },
});