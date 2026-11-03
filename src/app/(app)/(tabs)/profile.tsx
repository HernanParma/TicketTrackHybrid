import { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';

import { Button, Card, ErrorText, Muted, Screen, Title } from '@/components/ui';
import { useApp } from '@/context/AppProvider';
import { IDIOMAS, type Idioma, type ModoTema } from '@/i18n';

export default function ProfileScreen() {
  const { colors, user, t, themeMode, setThemeMode, language, setLanguage, reminder, setReminder, testReminder, signOut } =
    useApp();
  const [mostrarHora, setMostrarHora] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nombre = user?.displayName?.trim() || user?.email || t.genericProfile;
  const hora = `${String(reminder.hora).padStart(2, '0')}:${String(reminder.minuto).padStart(2, '0')}`;
  const temas: { id: ModoTema; etiqueta: string }[] = [
    { id: 'SISTEMA', etiqueta: t.themeSystem },
    { id: 'CLARO', etiqueta: t.themeDay },
    { id: 'OSCURO', etiqueta: t.themeNight },
  ];

  return (
    <Screen scroll tabInset>
      <Title>{t.profile}</Title>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={{ width: 64, height: 64, borderRadius: 32 }} />
          ) : (
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ color: colors.onPrimary, fontSize: 24, fontWeight: '800' }}>
                {nombre.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>{nombre}</Text>
            {user?.email ? <Muted>{user.email}</Muted> : null}
          </View>
        </View>
      </Card>

      <Card>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{t.appearance}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {temas.map((item) => (
            <Chip key={item.id} label={item.etiqueta} active={themeMode === item.id} onPress={() => setThemeMode(item.id)} />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={{ color: colors.text, fontWeight: '700' }}>{t.language}</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {IDIOMAS.map((item) => (
            <Chip
              key={item.id}
              label={item.etiqueta}
              active={language === item.id}
              onPress={() => setLanguage(item.id as Idioma)}
            />
          ))}
        </View>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{t.reminder}</Text>
            <Muted>{t.reminderDesc}</Muted>
          </View>
          <Switch
            value={reminder.activo}
            onValueChange={(activo) => {
              setError(null);
              void setReminder({ ...reminder, activo }).then((mensaje) => setError(mensaje));
            }}
            trackColor={{ true: colors.primary }}
          />
        </View>
        <Pressable onPress={() => setMostrarHora(true)}>
          <Muted>{t.reminderTime}</Muted>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>{hora}</Text>
        </Pressable>
        {mostrarHora ? (
          <DateTimePicker
            value={new Date(2026, 0, 1, reminder.hora, reminder.minuto)}
            mode="time"
            is24Hour
            onChange={(_event, elegida) => {
              setMostrarHora(false);
              if (!elegida) return;
              void setReminder({
                ...reminder,
                hora: elegida.getHours(),
                minuto: elegida.getMinutes(),
              }).then((mensaje) => setError(mensaje));
            }}
          />
        ) : null}
        <Button
          label={t.testReminder}
          tone="ghost"
          onPress={() => {
            setError(null);
            void testReminder().then((mensaje) => setError(mensaje));
          }}
        />
        <ErrorText>{error}</ErrorText>
      </Card>

      <Button label={t.signOut} tone="danger" onPress={() => void signOut()} />
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useApp();
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: active ? colors.primary : colors.chip,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}>
      <Text style={{ color: active ? colors.onPrimary : colors.text, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}
