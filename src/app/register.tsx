import { useState } from 'react';
import { Platform, Pressable, Text } from 'react-native';
import { Link } from 'expo-router';

import { GoogleButton } from '@/components/GoogleButton';
import { AuthPanel, Button, ErrorText, Field, Muted, Title } from '@/components/ui';
import { useApp } from '@/context/AppProvider';

export default function RegisterScreen() {
  const { colors, signUp } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const compacto = Platform.OS === 'web';

  const crear = async () => {
    setOcupado(true);
    setError(null);
    try {
      await signUp(email, password, repeat);
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo completar el ingreso. Probá de nuevo.');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <AuthPanel>
      <Title>Crear cuenta</Title>
      <Field compact={compacto} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
      <Field compact={compacto} value={password} onChangeText={setPassword} placeholder="Contraseña" secure />
      <Field compact={compacto} value={repeat} onChangeText={setRepeat} placeholder="Repetir contraseña" secure />
      <Muted>Mínimo 6 caracteres</Muted>
      <ErrorText>{error}</ErrorText>
      <Button
        compact={compacto}
        label={ocupado ? 'Creando...' : 'Crear cuenta'}
        disabled={ocupado}
        onPress={() => void crear()}
      />
      <GoogleButton compact={compacto} onError={setError} />
      <Link href="/login" asChild>
        <Pressable>
          <Text style={{ color: colors.primary, fontWeight: '700', textAlign: 'center' }}>
            Ya tengo cuenta, ingresar
          </Text>
        </Pressable>
      </Link>
    </AuthPanel>
  );
}
