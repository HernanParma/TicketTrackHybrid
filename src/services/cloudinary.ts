import * as Crypto from 'expo-crypto';

import { env, exigirCloudinary } from '@/config/env';

function publicId(uid: string, gastoId: string) {
  return `tickettrack/${uid}/${gastoId}`;
}

async function firmar(parametros: Record<string, string>): Promise<string> {
  exigirCloudinary();
  const base = Object.keys(parametros)
    .sort()
    .map((clave) => `${clave}=${parametros[clave]}`)
    .join('&');
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA1,
    base + env.cloudinary.apiSecret,
  );
}

function mensaje(cuerpo: string): string {
  try {
    const json = JSON.parse(cuerpo) as { error?: { message?: string } };
    const detalle = json.error?.message;
    if (detalle) return `No se pudo subir la foto. ${detalle}`;
  } catch {
    // El cuerpo no era JSON.
  }
  return 'No se pudo subir la foto a Cloudinary.';
}

export async function subirFoto(uri: string, uid: string, gastoId: string): Promise<string> {
  exigirCloudinary();
  const id = publicId(uid, gastoId);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const parametros = { overwrite: 'true', public_id: id, timestamp };
  const firma = await firmar(parametros);
  const cuerpo = new FormData();
  cuerpo.append('file', {
    uri,
    name: `${gastoId}.jpg`,
    type: 'image/jpeg',
  } as unknown as Blob);
  cuerpo.append('api_key', env.cloudinary.apiKey);
  cuerpo.append('timestamp', timestamp);
  cuerpo.append('public_id', id);
  cuerpo.append('overwrite', 'true');
  cuerpo.append('signature', firma);

  const respuesta = await fetch(
    `https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/image/upload`,
    { method: 'POST', body: cuerpo },
  );
  const texto = await respuesta.text();
  if (!respuesta.ok) throw new Error(mensaje(texto));
  const json = JSON.parse(texto) as { secure_url?: string };
  if (!json.secure_url) throw new Error('Cloudinary no devolvió la dirección de la foto.');
  return json.secure_url.replace(/\\\//g, '/');
}

export async function borrarFoto(uid: string, gastoId: string) {
  exigirCloudinary();
  const id = publicId(uid, gastoId);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const parametros = { public_id: id, timestamp };
  const firma = await firmar(parametros);
  const cuerpo = new URLSearchParams({
    public_id: id,
    timestamp,
    api_key: env.cloudinary.apiKey,
    signature: firma,
  });
  const respuesta = await fetch(
    `https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/image/destroy`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: cuerpo.toString(),
    },
  );
  if (!respuesta.ok) {
    const texto = await respuesta.text();
    throw new Error(mensaje(texto));
  }
}
