import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function AppStack() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
