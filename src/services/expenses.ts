import * as Crypto from 'expo-crypto';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';

import { esCategoria, type Categoria, type Gasto } from '@/model/expense';
import {
  confirmarSincronizado,
  encolarAlta,
  encolarBaja,
  fusionarConServidor,
  leerCache,
} from '@/services/cache';
import { borrarFoto, subirFoto } from '@/services/cloudinary';
import { dbFirebase } from '@/services/firebase';
import { hayInternet } from '@/services/network';

export type FotoNueva = { uri: string; base64: string };

export type DatosGasto = {
  amount: number;
  category: Categoria;
  description: string;
  photo: FotoNueva | null;
  existingPhotoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  placeLabel: string | null;
  createdAt: Date;
};

export async function gastosGuardados(userId: string): Promise<Gasto[]> {
  return leerCache(userId);
}

export function escucharGastos(
  userId: string,
  onLista: (gastos: Gasto[]) => void,
  onFallo: () => void,
) {
  const consulta = query(collection(dbFirebase(), 'gastos'), where('userId', '==', userId));
  return onSnapshot(
    consulta,
    (snapshot) => {
      const servidor = snapshot.docs
        .map((documento) => desdeDocumento(documento.id, documento.data()))
        .filter((gasto): gasto is Gasto => gasto != null);
      void fusionarConServidor(userId, servidor).then(onLista);
    },
    () => onFallo(),
  );
}

export async function crearGasto(userId: string, datos: DatosGasto): Promise<Gasto[]> {
  if (datos.amount <= 0) throw new Error('El monto tiene que ser mayor que 0.');
  const id = Crypto.randomUUID();
  let photoUrl: string | null = null;
  if (datos.photo && hayInternet()) {
    try {
      photoUrl = await subirFoto(datos.photo.base64, userId, id);
    } catch {
      photoUrl = null;
    }
  }
  const gasto = armar(id, userId, datos, photoUrl);
  const lista = await encolarAlta(userId, gasto);
  try {
    await setDoc(doc(dbFirebase(), 'gastos', id), aFirestore(gasto));
    await confirmarSincronizado(userId, id);
  } catch {}
  return lista;
}

export async function actualizarGasto(
  userId: string,
  gastoId: string,
  datos: DatosGasto,
): Promise<Gasto[]> {
  if (datos.amount <= 0) throw new Error('El monto tiene que ser mayor que 0.');
  let photoUrl = datos.existingPhotoUrl;
  if (datos.photo) {
    if (!hayInternet()) throw new Error('Sin internet no se puede subir la foto.');
    photoUrl = await subirFoto(datos.photo.base64, userId, gastoId);
  }
  const gasto = armar(gastoId, userId, datos, photoUrl);
  const lista = await encolarAlta(userId, gasto);
  try {
    await setDoc(doc(dbFirebase(), 'gastos', gastoId), aFirestore(gasto), { merge: true });
    await confirmarSincronizado(userId, gastoId);
  } catch (error) {
    if (hayInternet()) throw new Error(mensajeGasto(error));
  }
  return lista;
}

export async function eliminarGasto(userId: string, gastoId: string): Promise<Gasto[]> {
  try {
    await borrarFoto(userId, gastoId);
  } catch {}
  const lista = await encolarBaja(userId, gastoId);
  try {
    await deleteDoc(doc(dbFirebase(), 'gastos', gastoId));
    await confirmarSincronizado(userId, gastoId);
  } catch (error) {
    if (hayInternet()) throw new Error(mensajeGasto(error));
  }
  return lista;
}

function armar(id: string, userId: string, datos: DatosGasto, photoUrl: string | null): Gasto {
  return {
    id,
    userId,
    amount: datos.amount,
    category: datos.category,
    description: datos.description.trim(),
    photoUrl,
    latitude: datos.latitude,
    longitude: datos.longitude,
    placeLabel: datos.placeLabel?.trim() || null,
    createdAt: datos.createdAt,
    updatedAt: new Date(),
  };
}

function aFirestore(gasto: Gasto) {
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
    createdAt: Timestamp.fromDate(gasto.createdAt),
    updatedAt: Timestamp.fromDate(gasto.updatedAt),
  };
}

function desdeDocumento(id: string, data: Record<string, unknown>): Gasto | null {
  const userId = String(data.userId ?? '');
  if (!userId) return null;
  const category = esCategoria(String(data.category ?? '')) ? (data.category as Categoria) : 'OTROS';
  return {
    id: String(data.id || id),
    userId,
    amount: Number(data.amount) || 0,
    category,
    description: String(data.description ?? ''),
    photoUrl: textoONulo(data.photoUrl),
    latitude: numeroONulo(data.latitude),
    longitude: numeroONulo(data.longitude),
    placeLabel: textoONulo(data.placeLabel),
    createdAt: fechaDe(data.createdAt),
    updatedAt: fechaDe(data.updatedAt),
  };
}

function textoONulo(valor: unknown): string | null {
  if (typeof valor !== 'string') return null;
  const limpio = valor.trim();
  return limpio ? limpio : null;
}

function numeroONulo(valor: unknown): number | null {
  if (valor == null || valor === '') return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

function fechaDe(valor: unknown): Date {
  if (valor instanceof Timestamp) return valor.toDate();
  if (valor instanceof Date) return valor;
  if (typeof valor === 'number') return new Date(valor);
  if (valor && typeof valor === 'object' && 'seconds' in valor) {
    return new Date(Number((valor as { seconds: number }).seconds) * 1000);
  }
  return new Date();
}

function mensajeGasto(error: unknown): string {
  const texto = error instanceof Error ? error.message : '';
  if (texto.toLowerCase().includes('no se pudo subir la foto')) return texto;
  if (texto.toLowerCase().includes('falta ')) return texto;
  return texto || 'No se pudo guardar el gasto';
}