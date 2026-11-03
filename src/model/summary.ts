import { diasDelMes, mismoMes, tituloMes } from '@/model/dates';
import type { Categoria, Gasto } from '@/model/expense';
import { formatoPesos } from '@/model/money';

export type LineaResumen = {
  categoria: Categoria;
  total: number;
  cantidad: number;
  proporcion: number;
};

export type ResumenMes = {
  titulo: string;
  total: number;
  cantidad: number;
  promedioDiario: number;
  mayor: Gasto | null;
  totalMesAnterior: number;
  diferenciaMesAnterior: number;
  porCategoria: LineaResumen[];
};

export function resumenDelMes(gastos: Gasto[], ahora: Date = new Date()): ResumenMes {
  const delMes = gastos.filter((gasto) => mismoMes(gasto.createdAt, ahora));
  const total = delMes.reduce((suma, gasto) => suma + gasto.amount, 0);
  const mesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1, 12, 0, 0, 0);
  const totalMesAnterior = gastos
    .filter((gasto) => mismoMes(gasto.createdAt, mesAnterior))
    .reduce((suma, gasto) => suma + gasto.amount, 0);
  const dias = diasDelMes(ahora);
  const grupos = new Map<Categoria, Gasto[]>();
  delMes.forEach((gasto) => {
    const lista = grupos.get(gasto.category) ?? [];
    lista.push(gasto);
    grupos.set(gasto.category, lista);
  });
  const porCategoria = [...grupos.entries()]
    .map(([categoria, items]) => {
      const suma = items.reduce((acumulado, gasto) => acumulado + gasto.amount, 0);
      return {
        categoria,
        total: suma,
        cantidad: items.length,
        proporcion: total > 0 ? suma / total : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  return {
    titulo: tituloMes(ahora),
    total,
    cantidad: delMes.length,
    promedioDiario: dias > 0 ? total / dias : 0,
    mayor: delMes.reduce<Gasto | null>(
      (mayor, gasto) => (mayor == null || gasto.amount > mayor.amount ? gasto : mayor),
      null,
    ),
    totalMesAnterior,
    diferenciaMesAnterior: total - totalMesAnterior,
    porCategoria,
  };
}

export function textoComparacion(diferencia: number): string {
  const absoluto = Math.abs(diferencia);
  if (diferencia > 0.5) return `${formatoPesos(absoluto)} más que el mes anterior`;
  if (diferencia < -0.5) return `${formatoPesos(absoluto)} menos que el mes anterior`;
  return 'Igual que el mes anterior';
}
