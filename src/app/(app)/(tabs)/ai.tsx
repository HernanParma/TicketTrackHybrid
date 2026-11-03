import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppProvider';
import { preguntar } from '@/services/gemini';

type Mensaje = { id: string; propio: boolean; texto: string };

export default function AiScreen() {
  const { colors, expenses } = useApp();
  const insets = useSafeAreaInsets();
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: 'hola',
      propio: false,
      texto: 'Preguntame por tus gastos. Por ejemplo: ¿cuánto gasté en transporte este mes?',
    },
  ]);
  const lista = useRef<FlatList<Mensaje>>(null);

  const enviar = async () => {
    const pregunta = texto.trim();
    if (!pregunta || enviando) return;
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
      const mensaje = causa instanceof Error ? causa.message : 'No se pudo consultar al asistente';
      setMensajes((actual) => [...actual, { id: `${Date.now()}-error`, propio: false, texto: mensaje }]);
    } finally {
      setEnviando(false);
      lista.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700' }}>IA</Text>
        <Text style={{ color: colors.muted }}>
          Preguntá por los gastos que ya cargaste. La respuesta usa solo esos datos.
        </Text>
      </View>
      <FlatList
        ref={lista}
        style={{ flex: 1 }}
        data={mensajes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 16 }}
        onContentSizeChange={() => lista.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf: item.propio ? 'flex-end' : 'flex-start',
              maxWidth: '82%',
              backgroundColor: item.propio ? colors.primary : colors.card,
              borderRadius: 18,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}>
            <Text style={{ color: item.propio ? colors.onPrimary : colors.text }}>{item.texto}</Text>
          </View>
        )}
      />
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          padding: 12,
          paddingBottom: insets.bottom + 88,
          alignItems: 'center',
        }}>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escribí acá..."
          placeholderTextColor={colors.muted}
          style={{
            flex: 1,
            backgroundColor: colors.card,
            color: colors.text,
            borderRadius: 18,
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}
        />
        <Pressable
          onPress={() => void enviar()}
          disabled={enviando || !texto.trim()}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 12,
            opacity: enviando || !texto.trim() ? 0.5 : 1,
          }}>
          <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>{enviando ? '...' : 'Enviar'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
