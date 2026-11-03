let enLinea = true;

export function marcarEnLinea(valor: boolean) {
  enLinea = valor;
}

export function hayInternet() {
  return enLinea;
}
