import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useState } from 'react';
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
      contentContainerStyle={[
        styles.screenScroll,
        { paddingBottom: tabInset ? insets.bottom + 120 : 32 },
      ]}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex1, { paddingBottom: tabInset ? insets.bottom + 88 : 0 }]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.flex1, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {contenido}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useApp();
  return (
    <View style={[styles.card, { backgroundColor: colors.card }, style]}>
      {children}
    </View>
  );
}

export function Title({ children, light = false }: { children: ReactNode; light?: boolean }) {
  const { colors } = useApp();
  return (
    <Text style={[styles.title, { color: light ? colors.onPrimary : colors.text }]}>
      {children}
    </Text>
  );
}

export function Muted({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const { colors } = useApp();
  return <Text style={[styles.muted, { color: colors.muted }, style]}>{children}</Text>;
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
  const [isSecure, setIsSecure] = useState(secure);

  return (
    <View style={styles.fieldContainer}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        autoCorrect={keyboardType !== 'email-address'}
        secureTextEntry={isSecure}
        multiline={multiline}
        style={[
          styles.textInput,
          {
            color: colors.text,
            borderColor: colors.line,
            borderRadius: compact ? 12 : 16,
            paddingHorizontal: compact ? 16 : 18,
            paddingVertical: compact ? 10 : 14,
            paddingRight: secure ? 48 : 18,
            fontSize: compact ? 15 : 16,
            minHeight: multiline ? 80 : compact ? 48 : 54,
          },
        ]}
      />
      {secure && (
        <Pressable
          onPress={() => setIsSecure(!isSecure)}
          style={styles.eyeIcon}>
          <Ionicons name={isSecure ? 'eye-off' : 'eye'} size={22} color={colors.muted} />
        </Pressable>
      )}
    </View>
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
      <Text style={[styles.botonTexto, { color: tinta, fontSize: compact ? 15 : 16 }]}>
        {label}
      </Text>
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
    <View style={[styles.flex1, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.authScroll,
          {
            paddingTop: insets.top + (ancha ? 32 : 48),
            paddingBottom: insets.bottom + 32,
            paddingHorizontal: ancha ? 24 : 24,
          },
        ]}
        keyboardShouldPersistTaps="handled">
        <View
          style={[
            styles.authContainer,
            {
              maxWidth: web ? 400 : '100%',
              backgroundColor: ancha ? colors.card : 'transparent',
              borderRadius: ancha ? 24 : 0,
              borderWidth: ancha ? 1 : 0,
              borderColor: colors.line,
              padding: ancha ? 32 : 0,
            },
          ]}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  const { colors } = useApp();
  if (!children) return null;
  return (
    <View style={styles.errorContainer}>
      <Ionicons name="warning" size={18} color={colors.danger} />
      <Text style={[styles.errorText, { color: colors.danger }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  screenScroll: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  muted: {
    fontSize: 14,
  },
  fieldContainer: {
    justifyContent: 'center',
  },
  textInput: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    padding: 6,
  },
  boton: {
    minHeight: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  botonCompacto: {
    minHeight: 46,
    borderRadius: 23,
  },
  botonTexto: {
    fontWeight: '700',
  },
  authScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authContainer: {
    width: '100%',
    gap: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
  },
});