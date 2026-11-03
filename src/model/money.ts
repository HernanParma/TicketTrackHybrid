export function formatoPesos(monto: number): string {
  let entero = Math.trunc(monto);
  let centavos = Math.round((monto - entero) * 100);
  if (centavos === 100) {
    entero += 1;
    centavos = 0;
  }
  if (centavos < 0) {
    centavos = 0;
  }
  const miles = String(Math.abs(entero)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const signo = entero < 0 ? '-' : '';
  if (centavos === 0) return `${signo}$${miles}`;
  return `${signo}$${miles},${String(centavos).padStart(2, '0')}`;
}

export function parseMonto(texto: string): number {
  const limpio = texto.trim().replace(/\./g, '').replace(',', '.');
  const valor = Number(limpio);
  return Number.isFinite(valor) ? valor : 0;
}

export function montoParaEditar(amount: number): string {
  const entero = Math.trunc(amount);
  let centavos = Math.round((amount - entero) * 100);
  if (centavos === 100) return String(entero + 1);
  if (centavos <= 0) return String(entero);
  return `${entero},${String(centavos).padStart(2, '0')}`;
}
