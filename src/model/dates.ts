const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const MESES_LARGO = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export function inicioDeSemana(ahora: Date = new Date()): Date {
  const inicio = new Date(ahora);
  const diff = (inicio.getDay() + 6) % 7;
  inicio.setDate(inicio.getDate() - diff);
  inicio.setHours(0, 0, 0, 0);
  return inicio;
}

export function inicioDeMes(ahora: Date = new Date()): Date {
  return new Date(ahora.getFullYear(), ahora.getMonth(), 1, 0, 0, 0, 0);
}

export function mismoMes(fecha: Date, referencia: Date): boolean {
  return (
    fecha.getFullYear() === referencia.getFullYear() &&
    fecha.getMonth() === referencia.getMonth()
  );
}

export function tituloMes(fecha: Date): string {
  return `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

export function fechaCorta(fecha: Date): string {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}`;
}

export function fechaLarga(fecha: Date): string {
  return `${fecha.getDate()} de ${MESES_LARGO[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

export function fechaNumerica(fecha: Date): string {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

export function diasDelMes(fecha: Date): number {
  return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
}

export function mesConDesplazamiento(offset: number, ahora: Date = new Date()): Date {
  return new Date(ahora.getFullYear(), ahora.getMonth() + offset, 1, 12, 0, 0, 0);
}
