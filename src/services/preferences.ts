import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Idioma, ModoTema } from '@/i18n';

const TEMA = 'tickettrack_apariencia';
const IDIOMA = 'tickettrack_idioma';
const RECORDATORIO = 'tickettrack_recordatorio';

export type Recordatorio = {
  hora: number;
  minuto: number;
  activo: boolean;
};

const recordatorioInicial: Recordatorio = { hora: 21, minuto: 0, activo: false };

export async function leerTema(): Promise<ModoTema> {
  const valor = await AsyncStorage.getItem(TEMA);
  if (valor === 'CLARO' || valor === 'OSCURO' || valor === 'SISTEMA') return valor;
  return 'SISTEMA';
}

export async function guardarTema(modo: ModoTema) {
  await AsyncStorage.setItem(TEMA, modo);
}

export async function leerIdioma(): Promise<Idioma> {
  const valor = await AsyncStorage.getItem(IDIOMA);
  if (valor === 'es' || valor === 'en' || valor === 'pt') return valor;
  return 'es';
}

export async function guardarIdioma(idioma: Idioma) {
  await AsyncStorage.setItem(IDIOMA, idioma);
}

export async function leerRecordatorio(): Promise<Recordatorio> {
  const valor = await AsyncStorage.getItem(RECORDATORIO);
  if (!valor) return recordatorioInicial;
  try {
    const json = JSON.parse(valor) as Partial<Recordatorio>;
    return {
      hora: numeroEntre(json.hora, 0, 23, 21),
      minuto: numeroEntre(json.minuto, 0, 59, 0),
      activo: Boolean(json.activo),
    };
  } catch {
    return recordatorioInicial;
  }
}

export async function guardarRecordatorio(recordatorio: Recordatorio) {
  await AsyncStorage.setItem(RECORDATORIO, JSON.stringify(recordatorio));
}

function numeroEntre(valor: unknown, minimo: number, maximo: number, porDefecto: number) {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < minimo || numero > maximo) return porDefecto;
  return numero;
}
