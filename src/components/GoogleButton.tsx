
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

import { env } from '@/config/env';
import { useApp } from '@/context/AppProvider';
import { ingresarConVentanaGoogle } from '@/services/auth';

WebBrowser.maybeCompleteAuthSession();

type Props = {
  onError: (mensaje: string) => void;
  compact?: boolean;
};

function esExpoGo() {
  return (
    Constants.appOwnership === 'expo' ||
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  );
}

export function GoogleButton(props: Props) {
  if (Platform.OS === 'web') {
    return <GoogleButtonWeb {...props} />;
  }

  return <GoogleButtonNative {...props} />;
}

// IMPLEMENTACIÓN NATIVA (ANDROID / IOS)
function GoogleButtonNative({ onError, compact = false }: Props) {
  const { colors, signInWithGoogleToken } = useApp();

  useEffect(() => {
    if (env.googleWebClientId) {
      GoogleSignin.configure({
        webClientId: env.googleWebClientId,
      });
    }
  }, []);

  const handlePress = async () => {
    if (!env.googleWebClientId) {
      onError('Falta activar Google en Firebase y pegar GOOGLE_WEB_CLIENT_ID.');
      return;
    }

    if (esExpoGo()) {
      onError(
        'Google no se puede usar desde Expo Go. Entrá con email y contraseña, o utilizá un development build.'
      );
      return;
    }

    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const result = await GoogleSignin.signIn();

      if (result && 'type' in result && result.type === 'cancelled') {
        return;
      }

      const idToken =
        (result && 'data' in result
          ? result.data?.idToken
          : (result as { idToken?: string | null })?.idToken) ?? '';

      if (!idToken) {
        onError('Google no devolvió un token válido.');
        return;
      }

      await signInWithGoogleToken(idToken, null);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === statusCodes.SIGN_IN_CANCELLED
      ) {
        return;
      }

      onError(
        error instanceof Error
          ? error.message
          : 'No se pudo ingresar con Google. Probá de nuevo.'
      );
    }
  };

  return (
    <Pressable
      onPress={() => void handlePress()}
      style={({ pressed }) => [
        styles.botonGoogle,
        compact ? styles.botonCompacto : null,
        {
          borderColor: colors.line,
          backgroundColor: pressed ? colors.line : 'transparent',
        },
      ]}
    >
      <View style={styles.contenidoBoton}>
        <Ionicons name="person-circle" size={20} color={colors.text} />
        <Text
          style={[
            styles.textoGoogle,
            { color: colors.text, fontSize: compact ? 15 : 16 },
          ]}
        >
          Continuar con Google
        </Text>
      </View>
    </Pressable>
  );
}

// IMPLEMENTACIÓN WEB
function GoogleButtonWeb({ onError, compact = false }: Props) {
  const { colors, signInWithGoogleToken } = useApp();

  const [request, response, promptAsync] =
    Google.useIdTokenAuthRequest({
      webClientId: env.googleWebClientId || undefined,
      selectAccount: true,
    });

  useEffect(() => {
    if (!response) return;

    if (response.type === 'cancel' || response.type === 'dismiss') {
      return;
    }

    if (response.type !== 'success') {
      onError('No se pudo ingresar con Google. Probá de nuevo.');
      return;
    }

    const idToken =
      response.params.id_token ??
      response.authentication?.idToken ??
      '';

    const accessToken =
      response.params.access_token ??
      response.authentication?.accessToken ??
      null;

    if (!idToken) {
      onError('Google no devolvió un token. Revisá el ID de cliente web.');
      return;
    }

    void signInWithGoogleToken(idToken, accessToken).catch(
      (error: unknown) => {
        onError(
          error instanceof Error
            ? error.message
            : 'No se pudo ingresar con Google. Probá de nuevo.'
        );
      }
    );
  }, [response, onError, signInWithGoogleToken]);

  return (
    <Pressable
      onPress={() => {
        if (!env.googleWebClientId) {
          onError('Falta activar Google en Firebase y pegar GOOGLE_WEB_CLIENT_ID.');
          return;
        }

        void ingresarConVentanaGoogle().catch((error: unknown) => {
          onError(
            error instanceof Error
              ? error.message
              : 'No se pudo ingresar con Google. Probá de nuevo.'
          );
        });
      }}
      disabled={!request}
      style={({ pressed }) => [
        styles.botonGoogle,
        compact ? styles.botonCompacto : null,
        {
          borderColor: colors.line,
          backgroundColor: pressed ? colors.line : 'transparent',
          opacity: !request ? 0.5 : 1,
        },
      ]}
    >
      <View style={styles.contenidoBoton}>
        <Ionicons name="person-circle" size={20} color={colors.text} />
        <Text
          style={[
            styles.textoGoogle,
            { color: colors.text, fontSize: compact ? 15 : 16 },
          ]}
        >
          Continuar con Google
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botonGoogle: {
    minHeight: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  botonCompacto: {
    minHeight: 46,
    borderRadius: 23,
  },
  contenidoBoton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textoGoogle: {
    fontWeight: '700',
  },
});
