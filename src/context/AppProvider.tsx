import type { User } from '@firebase/auth';
import * as Network from 'expo-network';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Platform, useColorScheme } from 'react-native';

import { textos, type Idioma, type ModoTema } from '@/i18n';
import type { Gasto } from '@/model/expense';
import { cerrarSesion, ingresar, ingresarConGoogle, observarSesion, registrar } from '@/services/auth';
import {
  actualizarGasto,
  crearGasto,
  eliminarGasto,
  escucharGastos,
  gastosGuardados,
  type DatosGasto,
} from '@/services/expenses';
import { marcarEnLinea } from '@/services/network';
import {
  cancelarRecordatorio,
  pedirPermisoNotificaciones,
  programarRecordatorio,
} from '@/services/notifications';
import {
  guardarIdioma,
  guardarRecordatorio,
  guardarTema,
  leerIdioma,
  leerRecordatorio,
  leerTema,
  type Recordatorio,
} from '@/services/preferences';
import { claro, noche, type Paleta } from '@/theme/colors';

type AppContextValue = {
  ready: boolean;
  user: User | null;
  colors: Paleta;
  scheme: 'light' | 'dark';
  themeMode: ModoTema;
  setThemeMode: (modo: ModoTema) => void;
  language: Idioma;
  setLanguage: (idioma: Idioma) => void;
  t: (typeof textos)['es'];
  expenses: Gasto[];
  expensesReady: boolean;
  online: boolean;
  reminder: Recordatorio;
  setReminder: (recordatorio: Recordatorio) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, repeat: string) => Promise<void>;
  signInWithGoogleToken: (idToken: string, accessToken?: string | null) => Promise<void>;
  signOut: () => Promise<void>;
  saveExpense: (gastoId: string | null, datos: DatosGasto) => Promise<void>;
  removeExpense: (gastoId: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [themeMode, setThemeModeState] = useState<ModoTema>('SISTEMA');
  const [language, setLanguageState] = useState<Idioma>('es');
  const [reminder, setReminderState] = useState<Recordatorio>({ hora: 21, minuto: 0, activo: false });
  const [expenses, setExpenses] = useState<Gasto[]>([]);
  const [expensesReady, setExpensesReady] = useState(false);
  const [online, setOnline] = useState(true);
  const sesion = useRef<string | null>(null);

  const scheme = themeMode === 'OSCURO' || (themeMode === 'SISTEMA' && system === 'dark') ? 'dark' : 'light';
  const colors = scheme === 'dark' ? noche : claro;
  const t = textos[language];

  useEffect(() => {
    let activo = true;
    void Promise.all([leerTema(), leerIdioma(), leerRecordatorio()]).then(([tema, idioma, aviso]) => {
      if (!activo) return;
      setThemeModeState(tema);
      setLanguageState(idioma);
      setReminderState(aviso);
    });
    const unsub = observarSesion((usuario) => {
      if (!activo) return;
      const uid = usuario?.uid ?? null;
      if (sesion.current !== uid) {
        sesion.current = uid;
        setExpenses([]);
        setExpensesReady(!usuario);
      }
      setUser(usuario);
      setReady(true);
    });
    return () => {
      activo = false;
      unsub();
    };
  }, []);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  useEffect(() => {
    let activo = true;
    const aplicar = (conectado: boolean | null | undefined, alcanzable: boolean | null | undefined) => {
      const valor = conectado ? alcanzable !== false : false;
      if (!activo) return;
      setOnline(valor);
      marcarEnLinea(valor);
    };
    void Network.getNetworkStateAsync().then((estado) => aplicar(estado.isConnected, estado.isInternetReachable));
    const sub = Network.addNetworkStateListener((estado) => aplicar(estado.isConnected, estado.isInternetReachable));
    return () => {
      activo = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      void cancelarRecordatorio();
      return;
    }
    let activo = true;
    void gastosGuardados(user.uid).then((lista) => {
      if (!activo) return;
      setExpenses(lista);
      setExpensesReady(true);
    });
    const unsub = escucharGastos(
      user.uid,
      (lista) => {
        if (activo) setExpenses(lista);
      },
      () => {
        if (!activo) return;
        setOnline(false);
        marcarEnLinea(false);
      },
    );
    return () => {
      activo = false;
      unsub();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void programarRecordatorio(reminder.hora, reminder.minuto, reminder.activo);
  }, [user, reminder]);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      user,
      colors,
      scheme,
      themeMode,
      setThemeMode: (modo) => {
        setThemeModeState(modo);
        void guardarTema(modo);
      },
      language,
      setLanguage: (idioma) => {
        setLanguageState(idioma);
        void guardarIdioma(idioma);
      },
      t,
      expenses,
      expensesReady,
      online,
      reminder,
      setReminder: async (recordatorio) => {
        if (Platform.OS === 'web') {
          setReminderState(recordatorio);
          await guardarRecordatorio(recordatorio);
          return recordatorio.activo ? t.reminderWeb : null;
        }
        if (recordatorio.activo) {
          const permitido = await pedirPermisoNotificaciones();
          if (!permitido) return t.notificationsOff;
        }
        setReminderState(recordatorio);
        await guardarRecordatorio(recordatorio);
        return null;
      },
      signIn: ingresar,
      signUp: registrar,
      signInWithGoogleToken: ingresarConGoogle,
      signOut: cerrarSesion,
      saveExpense: async (gastoId, datos) => {
        if (!user) return;
        const lista = gastoId
          ? await actualizarGasto(user.uid, gastoId, datos)
          : await crearGasto(user.uid, datos);
        setExpenses(lista);
      },
      removeExpense: async (gastoId) => {
        if (!user) return;
        const lista = await eliminarGasto(user.uid, gastoId);
        setExpenses(lista);
      },
    }),
    [ready, user, colors, scheme, themeMode, language, t, expenses, expensesReady, online, reminder],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const valor = useContext(AppContext);
  if (!valor) throw new Error('useApp tiene que usarse dentro de AppProvider');
  return valor;
}
