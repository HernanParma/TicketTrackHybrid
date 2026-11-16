import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { createElement, useState } from 'react';
import { Platform, Pressable, ScrollView, Switch, Text, View, useWindowDimensions } from 'react-native';

import { Screen } from '@/components/ui';
import { useApp } from '@/context/AppProvider';
import { IDIOMAS, type Idioma, type ModoTema } from '@/i18n';

export default function ProfileScreen() {
  const { colors, user, t, themeMode, setThemeMode, language, setLanguage, reminder, setReminder, signOut } = useApp();
  const { width } = useWindowDimensions();
  const isWeb = width >= 700;

  const [mostrarHora, setMostrarHora] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nombre = user?.displayName?.trim();
  const correo = user?.email;
  const hora = `${String(reminder.hora).padStart(2, '0')}:${String(reminder.minuto).padStart(2, '0')}`;

  const colorBorde = `${colors.muted}40`;

  const temas: { id: ModoTema; etiqueta: string; icono: keyof typeof MaterialIcons.glyphMap }[] = [
    { id: 'SISTEMA', etiqueta: t.themeSystem, icono: 'smartphone' },
    { id: 'CLARO', etiqueta: t.themeDay, icono: 'wb-sunny' },
    { id: 'OSCURO', etiqueta: t.themeNight, icono: 'dark-mode' },
  ];

  const tarjetaUsuario = (
    <View
      style={{
        flex: isWeb ? 1 : undefined,
        backgroundColor: colors.primary + '20',
        borderRadius: 28,
        padding: isWeb ? 28 : 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: isWeb ? 0 : 32,
      }}>
      {user?.photoURL ? (
        <Image
          source={{ uri: user.photoURL }}
          style={{ width: isWeb ? 92 : 80, height: isWeb ? 92 : 80, borderRadius: isWeb ? 46 : 40, marginBottom: 16 }}
        />
      ) : (
        <View
          style={{
            width: isWeb ? 92 : 80,
            height: isWeb ? 92 : 80,
            borderRadius: isWeb ? 46 : 40,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
          <MaterialIcons name="person" size={isWeb ? 52 : 48} color={colors.onPrimary} />
        </View>
      )}
      {nombre ? (
        <Text style={{ color: colors.text, fontSize: isWeb ? 24 : 22, fontWeight: '700', marginBottom: 4, textAlign: 'center' }}>
          {nombre}
        </Text>
      ) : null}
      {correo ? (
        <Text style={{ color: colors.muted, fontSize: 16, textAlign: 'center' }}>{correo}</Text>
      ) : null}
    </View>
  );

  const tarjetaConfiguracion = (
    <View style={{ backgroundColor: colors.card, borderRadius: 28, padding: isWeb ? 22 : 20 }}>
      <Text style={{ fontWeight: '700', fontSize: 18, color: colors.text, marginBottom: 12 }}>{t.appearance}</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {temas.map((item) => {
          const activo = themeMode === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setThemeMode(item.id)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 12,
                borderRadius: 22,
                backgroundColor: activo ? colors.primary + '20' : 'transparent',
                borderWidth: 1,
                borderColor: activo ? 'transparent' : colorBorde,
              }}>
              <MaterialIcons name={item.icono} size={22} color={activo ? colors.primary : colors.muted} />
              <Text style={{ marginTop: 6, fontSize: 13, fontWeight: '700', color: activo ? colors.primary : colors.muted }}>
                {item.etiqueta}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={{ fontWeight: '700', fontSize: 18, color: colors.text, marginTop: 22, marginBottom: 12 }}>{t.language}</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {IDIOMAS.map((item) => {
          const activo = language === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setLanguage(item.id as Idioma)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 12,
                borderRadius: 22,
                backgroundColor: activo ? colors.primary + '20' : 'transparent',
                borderWidth: 1,
                borderColor: activo ? 'transparent' : colorBorde,
              }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: activo ? colors.primary : colors.muted }}>
                {item.etiqueta}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: 1, backgroundColor: colorBorde, marginVertical: 20 }} />

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialIcons name="notifications" size={24} color={colors.primary} />
        <View style={{ flex: 1, marginLeft: 16, paddingRight: 12 }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: colors.text }}>{t.reminder}</Text>
          <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>{t.reminderDesc}</Text>
        </View>
        <Switch
          value={reminder.activo}
          onValueChange={(activo) => {
            setError(null);
            setReminder({ ...reminder, activo })
              .then((mensaje) => setError(mensaje))
              .catch(() => setError(t.errReminderConfig));
          }}
          trackColor={{ true: colors.primary }}
        />
      </View>

      {reminder.activo ? (
        <View style={{ marginTop: 14 }}>
          <Pressable
            onPress={() => setMostrarHora((prev) => (Platform.OS === 'web' ? !prev : true))}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 4 }}>
            <Text style={{ color: colors.muted, fontSize: 15 }}>{t.reminderTime}</Text>
            <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800' }}>{hora}</Text>
          </Pressable>

          {mostrarHora && Platform.OS === 'web' ? (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 }}>
              {createElement('input', {
                type: 'time',
                value: hora,
                onChange: (e: { target: { value: string } }) => {
                  const val = e.target.value;
                  if (!val) return;
                  const [h, m] = val.split(':').map(Number);
                  if (!Number.isNaN(h) && !Number.isNaN(m)) {
                    setReminder({ ...reminder, hora: h, minuto: m })
                      .then((mensaje) => setError(mensaje))
                      .catch(() => setError(t.errReminderSave));
                  }
                },
                style: {
                  fontSize: 15,
                  fontWeight: '700',
                  padding: '6px 12px',
                  borderRadius: 12,
                  border: `1px solid ${colorBorde}`,
                  backgroundColor: colors.background,
                  color: colors.text,
                },
              })}
            </View>
          ) : null}

          {error ? <Text style={{ color: '#D32F2F', fontSize: 13, marginTop: 4 }}>{error}</Text> : null}
        </View>
      ) : null}
    </View>
  );

  if (isWeb) {
    return (
      <Screen tabInset>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 18, paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}>
          <View style={{ width: '100%', gap: 20 }}>
            {/* Barra superior con título y Cerrar sesión */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <Text style={{ color: colors.text, fontSize: 32, fontWeight: '700' }}>{t.profile}</Text>

              <Pressable
                onPress={() => void signOut()}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: 42,
                  paddingHorizontal: 20,
                  borderRadius: 21,
                  borderWidth: 1,
                  borderColor: '#D32F2F',
                  backgroundColor: colors.card,
                  gap: 8,
                }}>
                <MaterialIcons name="logout" size={18} color="#D32F2F" />
                <Text style={{ color: '#D32F2F', fontWeight: '700', fontSize: 15 }}>{t.signOut}</Text>
              </Pressable>
            </View>

            {/* Contenido principal en 2 columnas */}
            <View style={{ width: '100%', flexDirection: 'row', gap: 20, alignItems: 'stretch' }}>
              <View style={{ flex: 0.85 }}>{tarjetaUsuario}</View>

              <View style={{ flex: 1.5, gap: 10 }}>
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16, marginLeft: 6 }}>
                  {t.settingsTitle}
                </Text>
                {tarjetaConfiguracion}
              </View>
            </View>
          </View>
        </ScrollView>
      </Screen>
    );
  }

  return (
    <Screen tabInset>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        <Text style={{ color: colors.text, fontSize: 32, fontWeight: '700', marginBottom: 24 }}>{t.profile}</Text>

        {tarjetaUsuario}

        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16, marginLeft: 8, marginBottom: 8 }}>
          {t.settingsTitle}
        </Text>

        {tarjetaConfiguracion}
      </ScrollView>

      <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, backgroundColor: colors.background }}>
        <Pressable
          onPress={() => void signOut()}
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#D32F2F',
            borderRadius: 24,
            paddingVertical: 14,
          }}>
          <MaterialIcons name="logout" size={20} color="#D32F2F" />
          <Text style={{ color: '#D32F2F', fontWeight: '700', fontSize: 16, marginLeft: 8 }}>
            {t.signOut}
          </Text>
        </Pressable>
      </View>

      {mostrarHora && Platform.OS !== 'web' ? (
        <DateTimePicker
          value={new Date(2026, 0, 1, reminder.hora, reminder.minuto)}
          mode="time"
          is24Hour
          onChange={(event, elegida) => {
            setMostrarHora(false);
            if (event.type === 'dismissed' || !elegida) return;
            setReminder({
              ...reminder,
              hora: elegida.getHours(),
              minuto: elegida.getMinutes(),
            })
              .then((mensaje) => setError(mensaje))
              .catch(() => setError(t.errReminderSave));
          }}
        />
      ) : null}
    </Screen>
  );
}
