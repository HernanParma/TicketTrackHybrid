import { Link } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { GoogleButton } from '@/components/GoogleButton';
import { AuthPanel, Button, ErrorText, Field, Muted, Title } from '@/components/ui';
import { useApp } from '@/context/AppProvider';

export default function LoginScreen() {
  const { colors, signIn, t } = useApp();
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
      setError(causa instanceof Error ? causa.message : t.errorDefaultAuth);
    } finally {
      setOcupado(false);
    }
  };

  return (
    <AuthPanel>
      <View style={styles.headerContainer}>
        <Text style={styles.logoText}>
          <Text style={{ color: colors.primary }}>Ticket</Text>
          <Text style={{ color: colors.text }}>Track</Text>
        </Text>
        <Text style={[styles.slogan, { color: colors.muted }]}>
          {t.slogan}
        </Text>
      </View>

      <View style={styles.titleContainer}>
        <Title>{t.loginTitle}</Title>
      </View>

      <Field compact={compacto} value={email} onChangeText={setEmail} placeholder={t.emailPlaceholder} keyboardType="email-address" />
      <Field compact={compacto} value={password} onChangeText={setPassword} placeholder={t.passwordPlaceholder} secure />
      
      <Muted style={styles.hintText}>{t.passwordMin}</Muted>
      <ErrorText>{error}</ErrorText>
      
      <Button
        compact={compacto}
        label={ocupado ? t.btnEntering : t.loginTitle}
        disabled={ocupado}
        onPress={() => void entrar()}
      />
      <GoogleButton compact={compacto} onError={setError} />
      
      <Link href="/register" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={[styles.linkText, { color: colors.primary }]}>{t.linkCreateAccount}</Text>
        </Pressable>
      </Link>
    </AuthPanel>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 4,
  },
  logoText: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  slogan: {
    fontStyle: 'italic',
    fontSize: 14,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  hintText: {
    marginTop: -8,
    marginLeft: 4,
  },
  linkButton: {
    marginTop: 8,
    padding: 8,
  },
  linkText: {
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 15,
  },
});
