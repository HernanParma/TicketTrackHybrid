import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppProvider';

export default function TabsLayout() {
  const { colors, t } = useApp();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: Math.max(insets.bottom, 10),
          height: 68,
          borderRadius: 28,
          backgroundColor: colors.card,
          borderTopWidth: 0,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t.navExpenses,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="receipt-long" color={typeof color === 'string' ? color : colors.primary} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t.navMap,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="map" color={typeof color === 'string' ? color : colors.primary} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: t.navSummary,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="pie-chart" color={typeof color === 'string' ? color : colors.primary} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: t.navAi,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="auto-awesome" color={typeof color === 'string' ? color : colors.primary} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.navProfile,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={typeof color === 'string' ? color : colors.primary} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
