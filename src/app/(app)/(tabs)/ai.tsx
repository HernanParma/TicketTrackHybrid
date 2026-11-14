import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppProvider';
import { preguntar } from '@/services/gemini';

type Mensaje = { id: string; propio: boolean; texto: string };

export default function AiScreen() {
  const { colors, expenses, t } = useApp();
  const insets = useSafeAreaInsets();
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: 'hola',
      propio: false,
      texto: t.aiGreeting,
    },
  ]);
  const lista = useRef<FlatList<Mensaje>>(null);

  const enviar = async () => {
    const pregunta = texto.trim();
    if (!pregunta || enviando) return;

    setError(null);
    const propio: Mensaje = { id: `${Date.now()}`, propio: true, texto: pregunta };
    const historial = [...mensajes.filter((item) => item.id !== 'hola'), propio].map((item) => ({
      rol: item.propio ? ('user' as const) : ('model' as const),
      texto: item.texto,
    }));

    setMensajes((actual) => [...actual, propio]);
    setTexto('');
    setEnviando(true);

    try {
      const respuesta = await preguntar(expenses, historial);
      setMensajes((actual) => [...actual, { id: `${Date.now()}-ia`, propio: false, texto: respuesta }]);
    } catch (causa) {
      const mensajeError = causa instanceof Error ? causa.message : t.errConsultAi;
      setError(mensajeError);
      setTexto(pregunta);
      setMensajes((actual) => actual.filter((m) => m.id !== propio.id));
    } finally {
      setEnviando(false);
      setTimeout(() => lista.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ color: colors.text, fontSize: 32, fontWeight: '700' }}>{t.aiTitle}</Text>
        <Text style={{ color: colors.muted, fontSize: 15, marginTop: 4 }}>
          {t.aiSubtitle}
        </Text>
      </View>

      <FlatList
        ref={lista}
        style={{ flex: 1 }}
        data={mensajes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 24 }}
        onContentSizeChange={() => lista.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf: item.propio ? 'flex-end' : 'flex-start',
              maxWidth: '82%',
              backgroundColor: item.propio ? colors.primary : colors.card,
              borderRadius: 20,
              borderBottomLeftRadius: item.propio ? 20 : 6,
              borderBottomRightRadius: item.propio ? 6 : 20,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}>
            <Text style={{ color: item.propio ? colors.onPrimary : colors.text, fontSize: 16 }}>
              {item.id === 'hola' ? t.aiGreeting : item.texto}
            </Text>
          </View>
        )}
      />

      <View style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 88, backgroundColor: colors.background }}>
        {error ? (
          <Text style={{ color: '#D32F2F', fontSize: 13, marginBottom: 8, paddingHorizontal: 4 }}>
            {error}
          </Text>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <TextInput
            value={texto}
            onChangeText={(valor) => {
              setTexto(valor);
              if (error) setError(null);
            }}
            placeholder={t.aiPlaceholder}
            placeholderTextColor={colors.muted}
            editable={!enviando}
            multiline
            style={{
              flex: 1,
              backgroundColor: colors.card,
              color: colors.text,
              borderRadius: 24,
              paddingHorizontal: 18,
              paddingTop: 14,
              paddingBottom: 14,
              maxHeight: 100,
              fontSize: 16,
            }}
          />
          <Pressable
            onPress={() => void enviar()}
            disabled={enviando || !texto.trim()}
            style={{
              backgroundColor: enviando || !texto.trim() ? colors.card : colors.primary,
              borderRadius: 24,
              paddingHorizontal: 20,
              height: 48,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{
              color: enviando || !texto.trim() ? colors.muted : colors.onPrimary,
              fontWeight: '700',
              fontSize: 16
            }}>
              {enviando ? '...' : t.btnSend}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}