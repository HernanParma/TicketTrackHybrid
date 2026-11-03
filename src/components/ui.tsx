import { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/context/AppProvider';

export function Screen({
  children,
  scroll = false,
  tabInset = false,
}: {
  children: ReactNode;
  scroll?: boolean;
  tabInset?: boolean;
}) {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();
  const contenido = scroll ? (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingBottom: tabInset ? insets.bottom + 120 : 32,
        gap: 12,
      }}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, paddingBottom: tabInset ? insets.bottom + 88 : 0 }}>{children}</View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>{contenido}</View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useApp();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 24,
          padding: 16,
          gap: 12,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export function Title({ children, light = false }: { children: ReactNode; light?: boolean }) {
  const { colors } = useApp();
  return (
    <Text style={{ color: light ? colors.onPrimary : colors.text, fontSize: 22, fontWeight: '700' }}>
      {children}
    </Text>
  );
}

export function Muted({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const { colors } = useApp();
  return <Text style={[{ color: colors.muted, fontSize: 14 }, style]}>{children}</Text>;
}

export function Field({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  secure,
  compact = false,
}: {
  value: string;
  onChangeText: (texto: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'decimal-pad' | 'email-address';
  multiline?: boolean;
  secure?: boolean;
  compact?: boolean;
}) {
  const { colors } = useApp();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      keyboardType={keyboardType}
      autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
      autoCorrect={keyboardType !== 'email-address'}
      secureTextEntry={secure}
      multiline={multiline}
      style={{
        backgroundColor: colors.input,
        color: colors.text,
        borderRadius: compact ? 12 : 16,
        paddingHorizontal: compact ? 12 : 14,
        paddingVertical: compact ? 8 : 12,
        fontSize: compact ? 15 : 16,
        minHeight: multiline ? 80 : compact ? 42 : undefined,
      }}
    />
  );
}

export function Button({
  label,
  onPress,
  disabled,
  tone = 'primary',
  compact = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'ghost' | 'danger';
  compact?: boolean;
}) {
  const { colors } = useApp();
  const fondo = tone === 'primary' ? colors.primary : tone === 'danger' ? colors.danger : colors.chip;
  const tinta = tone === 'ghost' ? colors.text : tone === 'primary' ? colors.onPrimary : '#FFFFFF';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.boton,
        compact ? styles.botonCompacto : null,
        { backgroundColor: fondo, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}>
      <Text style={{ color: tinta, fontWeight: '700', fontSize: compact ? 15 : 16 }}>{label}</Text>
    </Pressable>
  );
}

export function AuthPanel({ children }: { children: ReactNode }) {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const web = Platform.OS === 'web';
  const ancha = web && width >= 760;
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: ancha ? 0 : insets.top }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: ancha ? 'center' : 'flex-start',
          alignItems: web ? 'center' : 'stretch',
          paddingHorizontal: ancha ? 24 : 16,
          paddingTop: ancha ? 32 : 16,
          paddingBottom: insets.bottom + 32,
        }}
        keyboardShouldPersistTaps="handled">
        <View
          style={{
            width: '100%',
            maxWidth: web ? 400 : undefined,
            gap: web ? 10 : 12,
            backgroundColor: ancha ? colors.card : 'transparent',
            borderRadius: ancha ? 24 : 0,
            borderWidth: ancha ? 1 : 0,
            borderColor: colors.line,
            padding: ancha ? 24 : 0,
          }}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  const { colors } = useApp();
  if (!children) return null;
  return <Text style={{ color: colors.danger, fontSize: 14 }}>{children}</Text>;
}

const styles = StyleSheet.create({
  boton: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  botonCompacto: {
    minHeight: 42,
    borderRadius: 12,
  },
});
