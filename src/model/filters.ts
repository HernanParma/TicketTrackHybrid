import { inicioDeMes, inicioDeSemana } from '@/model/dates';
import type { Categoria, Gasto, Periodo } from '@/model/expense';

export function filtrarGastos(
  gastos: Gasto[],
  categoria: Categoria | null,
  periodo: Periodo,
  ahora: Date = new Date(),
): Gasto[] {
  const desde =
    periodo === 'TODOS' ? null : periodo === 'SEMANA' ? inicioDeSemana(ahora) : inicioDeMes(ahora);
  return gastos.filter((gasto) => {
    const categoriaOk = categoria == null || gasto.category === categoria;
    const periodoOk = desde == null || gasto.createdAt.getTime() >= desde.getTime();
    return categoriaOk && periodoOk;
  });
}
