import { hayInternet } from '@/services/network';

type Direccion = Record<string, string | undefined>;

function primerTexto(direccion: Direccion | undefined, claves: string[]): string {
  if (!direccion) return '';
  for (const clave of claves) {
    const valor = direccion[clave];
    if (valor && valor.trim()) return valor.trim();
  }
  return '';
}

export async function etiquetaDeLugar(latitud: number, longitud: number): Promise<string | null> {
  if (!hayInternet()) return null;
  try {
    const respuesta = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitud}&lon=${longitud}&format=json&accept-language=es`,
      {
        headers: {
          'User-Agent': 'TicketTrack/1.0 (React Native)',
          Accept: 'application/json',
        },
      },
    );
    if (!respuesta.ok) return null;
    const json = (await respuesta.json()) as {
      address?: Direccion;
      display_name?: string;
    };
    const calle = primerTexto(json.address, ['road', 'pedestrian', 'neighbourhood']);
    const ciudad = primerTexto(json.address, ['city', 'town', 'village', 'suburb', 'state']);
    if (calle && ciudad) return `${calle}, ${ciudad}`;
    if (ciudad) return ciudad;
    const tramo = json.display_name?.split(',')[0]?.trim();
    return tramo || null;
  } catch {
    return null;
  }
}
