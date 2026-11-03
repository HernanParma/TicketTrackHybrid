import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';

import { GoogleButton } from '@/components/GoogleButton';
import { AuthPanel, Button, ErrorText, Field, Muted, Title } from '@/components/ui';
import { useApp } from '@/context/AppProvider';

export default function LoginScreen() {
  const { colors, signIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const compacto = Platform.OS === 'web';

  const entrar = async () => {
    setOcupado(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo completar el ingreso. Probá de nuevo.');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <AuthPanel>
      <View style={{ gap: 4, marginBottom: 6 }}>
        <Text style={{ color: colors.primary, fontWeight: '800', letterSpacing: 1, fontSize: 13 }}>TICKETTRACK</Text>
        <Title>Ingresar</Title>
        <Muted>Tus gastos en un solo lugar</Muted>
      </View>
      <Field compact={compacto} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
      <Field compact={compacto} value={password} onChangeText={setPassword} placeholder="Contraseña" secure />
      <Muted>Mínimo 6 caracteres</Muted>
      <ErrorText>{error}</ErrorText>
      <Button
        compact={compacto}
        label={ocupado ? 'Ingresando...' : 'Ingresar'}
        disabled={ocupado}
        onPress={() => void entrar()}
      />
      <GoogleButton compact={compacto} onError={setError} />
      <Link href="/register" asChild>
        <Pressable>
          <Text style={{ color: colors.primary, fontWeight: '700', textAlign: 'center' }}>Crear cuenta nueva</Text>
        </Pressable>
      </Link>
    </AuthPanel>
  );
}
