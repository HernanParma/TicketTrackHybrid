import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';

import { AppProvider, useApp } from '@/context/AppProvider';

SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

function useCliente() {
  const [cliente, setCliente] = useState(false);
  useEffect(() => {
    setCliente(true);
  }, []);
  return cliente;
}

function RootNavigator() {
  const { ready, user, scheme, colors, signInWithGoogleToken } = useApp();
  const segments = useSegments();
  const router = useRouter();
  const retornoGoogle = useRef(false);
  const enApp = segments[0] === '(app)';
  const enAuth = segments[0] === 'login' || segments[0] === 'register';
  const redirigiendo =
    ready && !retornoGoogle.current && ((!user && !enAuth) || (Boolean(user) && !enApp));

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const idToken = params.get('id_token');
    if (!idToken) return;
    retornoGoogle.current = true;
    const accessToken = params.get('access_token');
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    void signInWithGoogleToken(idToken, accessToken).catch(() => {
      retornoGoogle.current = false;
      router.replace('/login');
    });
  }, [router, signInWithGoogleToken]);

  useEffect(() => {
    if (!ready || retornoGoogle.current) return;
    if (!user && !enAuth) router.replace('/login');
    else if (user && !enApp) router.replace('/');
  }, [ready, user, enApp, enAuth, router]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
      {!ready || redirigiendo ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  const cliente = useCliente();
  return (
    <AppProvider>
      {cliente ? (
        <RootNavigator />
      ) : (
        <View style={{ flex: 1, backgroundColor: '#0B100E' }} />
      )}
    </AppProvider>
  );
}
