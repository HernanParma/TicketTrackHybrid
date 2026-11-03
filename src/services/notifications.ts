import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

const CANAL = 'recordatorios';
const AVISO = 'tickettrack-recordatorio';
const TEXTO = '¿Cargaste tus gastos de hoy?';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function prepararCanal() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL, {
    name: 'Recordatorios',
    importance: AndroidImportance.DEFAULT,
    description: 'Aviso diario para cargar los gastos',
  });
}

export async function programarRecordatorio(hora: number, minuto: number, activo: boolean) {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(AVISO).catch(() => undefined);
  if (!activo) return;
  const permiso = await Notifications.getPermissionsAsync();
  if (!permiso.granted) return;
  await prepararCanal();
  await Notifications.scheduleNotificationAsync({
    identifier: AVISO,
    content: {
      title: 'TicketTrack',
      body: TEXTO,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hora,
      minute: minuto,
      channelId: CANAL,
    },
  });
}

export async function cancelarRecordatorio() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(AVISO).catch(() => undefined);
}

export async function probarRecordatorio(): Promise<string | null> {
  if (Platform.OS === 'web') return 'web';
  const permiso = await Notifications.requestPermissionsAsync();
  if (!permiso.granted) return 'denied';
  await prepararCanal();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'TicketTrack',
      body: TEXTO,
      sound: true,
    },
    trigger: null,
  });
  return null;
}

export async function pedirPermisoNotificaciones(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const actual = await Notifications.getPermissionsAsync();
  if (actual.granted) return true;
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.granted;
}
