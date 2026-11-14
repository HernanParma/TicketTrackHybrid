import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppProvider';

export default function TabsLayout() {
  const { colors, t } = useApp();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isWeb = width >= 700;
  const dockWidth = Math.min(width - 32, 580);
  const horizontalInset = isWeb ? (width - dockWidth) / 2 : 16;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          position: 'absolute',
          left: horizontalInset,
          right: horizontalInset,
          bottom: Math.max(insets.bottom, isWeb ? 16 : 10),
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
          tabBarIcon: ({ focused, color, size }) => (
            <View style={[styles.iconContainer, { backgroundColor: focused ? colors.chip : 'transparent' }]}>
              <MaterialIcons name="receipt-long" color={typeof color === 'string' ? color : colors.primary} size={size} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t.navMap,
          tabBarIcon: ({ focused, color, size }) => (
            <View style={[styles.iconContainer, { backgroundColor: focused ? colors.chip : 'transparent' }]}>
              <MaterialIcons name="map" color={typeof color === 'string' ? color : colors.primary} size={size} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: t.navSummary,
          tabBarIcon: ({ focused, color, size }) => (
            <View style={[styles.iconContainer, { backgroundColor: focused ? colors.chip : 'transparent' }]}>
              <MaterialIcons name="pie-chart" color={typeof color === 'string' ? color : colors.primary} size={size} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: t.navAi,
          tabBarIcon: ({ focused, color, size }) => (
            <View style={[styles.iconContainer, { backgroundColor: focused ? colors.chip : 'transparent' }]}>
              <MaterialIcons name="auto-awesome" color={typeof color === 'string' ? color : colors.primary} size={size} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.navProfile,
          tabBarIcon: ({ focused, color, size }) => (
            <View style={[styles.iconContainer, { backgroundColor: focused ? colors.chip : 'transparent' }]}>
              <MaterialIcons name="person" color={typeof color === 'string' ? color : colors.primary} size={size} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 50,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});