import { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { Button } from '@/components/ui';
import { env } from '@/config/env';
import { useApp } from '@/context/AppProvider';

WebBrowser.maybeCompleteAuthSession();

export function GoogleButton({
  onError,
  compact = false,
}: {
  onError: (mensaje: string) => void;
  compact?: boolean;
}) {
  const { signInWithGoogleToken } = useApp();
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: env.googleWebClientId || undefined,
    androidClientId: env.googleAndroidClientId || undefined,
    iosClientId: env.googleWebClientId || undefined,
    selectAccount: true,
  });

  useEffect(() => {
    if (!response) return;
    if (response.type === 'cancel' || response.type === 'dismiss') return;
    if (response.type !== 'success') {
      onError('No se pudo ingresar con Google. Probá de nuevo.');
      return;
    }
    const idToken = response.params.id_token ?? response.authentication?.idToken ?? '';
    const accessToken = response.params.access_token ?? response.authentication?.accessToken ?? null;
    if (!idToken) {
      onError('Google no devolvió un token. Revisá el ID de cliente web.');
      return;
    }
    void signInWithGoogleToken(idToken, accessToken).catch((error: unknown) => {
      onError(error instanceof Error ? error.message : 'No se pudo ingresar con Google. Probá de nuevo.');
    });
  }, [response, onError, signInWithGoogleToken]);

  return (
    <Button
      label="Continuar con Google"
      tone="ghost"
      compact={compact}
      disabled={!request}
      onPress={() => {
        if (!env.googleWebClientId) {
          onError('Falta activar Google en Firebase y pegar GOOGLE_WEB_CLIENT_ID.');
          return;
        }
        void promptAsync();
      }}
    />
  );
}
