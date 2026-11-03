export const CATEGORIAS = [
  'SUPERMERCADO',
  'TRANSPORTE',
  'SERVICIOS',
  'OCIO',
  'SALUD',
  'OTROS',
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export const CATEGORIA_COLOR: Record<Categoria, string> = {
  SUPERMERCADO: '#0C8A62',
  TRANSPORTE: '#2563EB',
  SERVICIOS: '#7C3AED',
  OCIO: '#EA580C',
  SALUD: '#E11D48',
  OTROS: '#64748B',
};

export const CATEGORIA_ICONO = {
  SUPERMERCADO: 'shopping-cart',
  TRANSPORTE: 'directions-bus',
  SERVICIOS: 'receipt-long',
  OCIO: 'local-activity',
  SALUD: 'favorite',
  OTROS: 'category',
} as const;

export const CATEGORIA_ES: Record<Categoria, string> = {
  SUPERMERCADO: 'Supermercado',
  TRANSPORTE: 'Transporte',
  SERVICIOS: 'Servicios',
  OCIO: 'Ocio',
  SALUD: 'Salud',
  OTROS: 'Otros',
};

export type Gasto = {
  id: string;
  userId: string;
  amount: number;
  category: Categoria;
  description: string;
  photoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  placeLabel: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Periodo = 'TODOS' | 'SEMANA' | 'MES';

export function esCategoria(valor: string): valor is Categoria {
  return (CATEGORIAS as readonly string[]).includes(valor);
}

export function coordenadasValidas(latitud: number | null, longitud: number | null): boolean {
  return (
    latitud != null &&
    longitud != null &&
    Number.isFinite(latitud) &&
    Number.isFinite(longitud) &&
    latitud >= -90 &&
    latitud <= 90 &&
    longitud >= -180 &&
    longitud <= 180
  );
}

export function textoUbicacion(
  placeLabel: string | null | undefined,
  latitud: number | null | undefined,
  longitud: number | null | undefined,
): string | null {
  if (placeLabel && placeLabel.trim()) return placeLabel.trim();
  if (latitud == null || longitud == null) return null;
  return `${latitud.toFixed(5)}, ${longitud.toFixed(5)}`;
}

export const BUENOS_AIRES = { latitude: -34.6037, longitude: -58.3816 };
