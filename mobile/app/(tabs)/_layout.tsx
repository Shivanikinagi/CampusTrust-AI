import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: COLORS.bgDark + 'F0',
            borderTopColor: COLORS.borderDark,
            borderTopWidth: 1,
            height: 88,
            paddingBottom: 28,
            paddingTop: 8,
          },
          default: {
            backgroundColor: COLORS.bgDark + 'F0',
            borderTopColor: COLORS.borderDark,
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 8,
            paddingTop: 6,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="voting"
        options={{
          title: 'Vote',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'checkmark-done-circle' : 'checkmark-done-circle-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Check-In',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.scanButton,
              focused && styles.scanButtonActive
            ]}>
              <Ionicons name="qr-code" size={24} color={focused ? '#FFFFFF' : COLORS.primary} />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: -4,
          },
        }}
      />
      <Tabs.Screen
        name="credentials"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
      {/* Hidden module screens - accessible via navigation from Home */}
      <Tabs.Screen
        name="permissions"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="compute"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="research"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="governance"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="grants"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="badges"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -16,
    borderWidth: 3,
    borderColor: COLORS.bgDark,
  },
  scanButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
