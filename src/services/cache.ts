import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { esCategoria, type Categoria, type Gasto } from '@/model/expense';

type GastoJson = {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  photoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  placeLabel: string | null;
  createdAt: number;
  updatedAt: number;
};

type ArchivoCache = {
  expenses: GastoJson[];
  pendingUpserts: GastoJson[];
  pendingDeletes: string[];
};

function vacio(): ArchivoCache {
  return { expenses: [], pendingUpserts: [], pendingDeletes: [] };
}

function clave(userId: string) {
  return `tickettrack_offline_${userId}`;
}

function archivo(userId: string) {
  const carpeta = new Directory(Paths.document, 'tickettrack_offline');
  if (!carpeta.exists) carpeta.create({ intermediates: true, idempotent: true });
  return new File(carpeta, `${userId}.json`);
}

async function leerTexto(userId: string): Promise<string | null> {
  if (Platform.OS === 'web') return AsyncStorage.getItem(clave(userId));
  const file = archivo(userId);
  if (!file.exists) return null;
  return file.text();
}

async function escribirTexto(userId: string, texto: string) {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(clave(userId), texto);
    return;
  }
  const file = archivo(userId);
  if (!file.exists) file.create({ intermediates: true, overwrite: true });
  await file.write(texto);
}

function desdeJson(item: GastoJson): Gasto | null {
  if (!item.id) return null;
  const category: Categoria = esCategoria(item.category) ? item.category : 'OTROS';
  return {
    id: item.id,
    userId: item.userId,
    amount: Number(item.amount) || 0,
    category,
    description: item.description ?? '',
    photoUrl: item.photoUrl || null,
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
    placeLabel: item.placeLabel || null,
    createdAt: new Date(item.createdAt || Date.now()),
    updatedAt: new Date(item.updatedAt || Date.now()),
  };
}

function aJson(gasto: Gasto): GastoJson {
  return {
    id: gasto.id,
    userId: gasto.userId,
    amount: gasto.amount,
    category: gasto.category,
    description: gasto.description,
    photoUrl: gasto.photoUrl,
    latitude: gasto.latitude,
    longitude: gasto.longitude,
    placeLabel: gasto.placeLabel,
    createdAt: gasto.createdAt.getTime(),
    updatedAt: gasto.updatedAt.getTime(),
  };
}

function ordenar(gastos: Gasto[]): Gasto[] {
  return [...gastos].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function parsear(texto: string): ArchivoCache {
  const json = JSON.parse(texto) as ArchivoCache | GastoJson[];
  if (Array.isArray(json)) return { expenses: json, pendingUpserts: [], pendingDeletes: [] };
  return {
    expenses: json.expenses ?? [],
    pendingUpserts: json.pendingUpserts ?? [],
    pendingDeletes: json.pendingDeletes ?? [],
  };
}

export async function leerCache(userId: string): Promise<Gasto[]> {
  try {
    const texto = await leerTexto(userId);
    if (!texto) return [];
    return ordenar(parsear(texto).expenses.map(desdeJson).filter((gasto): gasto is Gasto => gasto != null));
  } catch {
    return [];
  }
}

async function leerArchivo(userId: string): Promise<ArchivoCache> {
  try {
    const texto = await leerTexto(userId);
    if (!texto) return vacio();
    return parsear(texto);
  } catch {
    return vacio();
  }
}

async function guardarArchivo(userId: string, archivoCache: ArchivoCache) {
  await escribirTexto(userId, JSON.stringify(archivoCache));
}

export async function guardarLista(userId: string, gastos: Gasto[]) {
  const actual = await leerArchivo(userId);
  actual.expenses = ordenar(gastos).map(aJson);
  await guardarArchivo(userId, actual);
}

export async function encolarAlta(userId: string, gasto: Gasto): Promise<Gasto[]> {
  const actual = await leerArchivo(userId);
  const json = aJson(gasto);
  const visibles = actual.expenses.filter((item) => item.id !== gasto.id);
  visibles.unshift(json);
  actual.expenses = visibles;
  actual.pendingUpserts = actual.pendingUpserts.filter((item) => item.id !== gasto.id);
  actual.pendingUpserts.push(json);
  actual.pendingDeletes = actual.pendingDeletes.filter((id) => id !== gasto.id);
  await guardarArchivo(userId, actual);
  return ordenar(visibles.map(desdeJson).filter((item): item is Gasto => item != null));
}

export async function encolarBaja(userId: string, gastoId: string): Promise<Gasto[]> {
  const actual = await leerArchivo(userId);
  actual.expenses = actual.expenses.filter((item) => item.id !== gastoId);
  actual.pendingUpserts = actual.pendingUpserts.filter((item) => item.id !== gastoId);
  if (!actual.pendingDeletes.includes(gastoId)) actual.pendingDeletes.push(gastoId);
  await guardarArchivo(userId, actual);
  return ordenar(actual.expenses.map(desdeJson).filter((item): item is Gasto => item != null));
}

export async function fusionarConServidor(userId: string, servidor: Gasto[]): Promise<Gasto[]> {
  const actual = await leerArchivo(userId);
  const idsServidor = new Set(servidor.map((gasto) => gasto.id));
  const pendientes = actual.pendingUpserts
    .map(desdeJson)
    .filter((gasto): gasto is Gasto => gasto != null && !idsServidor.has(gasto.id));
  const bajas = new Set(actual.pendingDeletes.filter((id) => idsServidor.has(id)));
  const visibles = ordenar([
    ...servidor.filter((gasto) => !bajas.has(gasto.id)),
    ...pendientes.filter((gasto) => !bajas.has(gasto.id)),
  ]);
  await guardarArchivo(userId, {
    expenses: visibles.map(aJson),
    pendingUpserts: pendientes.map(aJson),
    pendingDeletes: [...bajas],
  });
  return visibles;
}

export async function confirmarSincronizado(userId: string, gastoId: string) {
  const actual = await leerArchivo(userId);
  actual.pendingUpserts = actual.pendingUpserts.filter((item) => item.id !== gastoId);
  actual.pendingDeletes = actual.pendingDeletes.filter((id) => id !== gastoId);
  await guardarArchivo(userId, actual);
}
