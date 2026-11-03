import { CATEGORIA_ES, esCategoria, type Categoria, type Gasto } from '@/model/expense';
import { fechaNumerica } from '@/model/dates';
import { formatoPesos } from '@/model/money';
import { resumenDelMes } from '@/model/summary';
import { exigirGemini } from '@/config/env';
import { hayInternet } from '@/services/network';

const MODELO = 'gemini-3.8-flash';
const INSTRUCCION =
  'Sos un asistente de gastos personales en Argentina. ' +
  'Respondé solo con JSON, sin markdown, con las claves ' +
  'amount (número con punto decimal, o null), ' +
  'category (una de: SUPERMERCADO, TRANSPORTE, SERVICIOS, OCIO, SALUD, OTROS), ' +
  'description (nota corta en español) y place (lugar o null).';

export type SugerenciaGasto = {
  amount: number | null;
  category: Categoria | null;
  description: string;
  placeLabel: string | null;
};

type Parte = { text?: string; thought?: boolean; inline_data?: { mime_type: string; data: string } };

export async function interpretarFrase(frase: string): Promise<SugerenciaGasto> {
  const texto = await generar(INSTRUCCION, [{ text: `El usuario dijo: "${frase}"` }], true);
  return sugerenciaDesde(texto);
}

export async function leerTicket(base64: string): Promise<SugerenciaGasto> {
  const texto = await generar(
    INSTRUCCION,
    [
      { text: 'Leé este ticket y completá el gasto.' },
      { inline_data: { mime_type: 'image/jpeg', data: base64 } },
    ],
    true,
  );
  return sugerenciaDesde(texto);
}

export async function preguntar(gastos: Gasto[], historial: { rol: 'user' | 'model'; texto: string }[]) {
  const instruccion =
    'Respondé en español, de forma corta, sobre los gastos de TicketTrack. ' +
    'Usá solo los datos del contexto. Si no alcanzan, decilo. No inventes gastos.\n\n' +
    contextoDe(gastos);
  return generar(
    instruccion,
    undefined,
    false,
    historial.map((mensaje) => ({
      role: mensaje.rol,
      parts: [{ text: mensaje.texto }],
    })),
  );
}

function contextoDe(gastos: Gasto[]): string {
  const resumen = resumenDelMes(gastos);
  const porCategoria =
    resumen.porCategoria
      .map((linea) => `- ${CATEGORIA_ES[linea.categoria]}: ${formatoPesos(linea.total)}`)
      .join('\n') || 'Sin gastos en el mes.';
  const recientes =
    gastos
      .slice(0, 40)
      .map((gasto) => {
        const lugar = gasto.placeLabel?.trim() ?? '';
        return `${fechaNumerica(gasto.createdAt)} | ${CATEGORIA_ES[gasto.category]} | ${formatoPesos(gasto.amount)} | ${gasto.description} | ${lugar}`;
      })
      .join('\n') || 'No hay gastos cargados.';
  return (
    `Mes ${resumen.titulo}: total ${formatoPesos(resumen.total)}, ` +
    `cantidad ${resumen.cantidad}, promedio ${formatoPesos(resumen.promedioDiario)}.\n` +
    `Gastos por categoría:\n${porCategoria}\n\nGastos recientes:\n${recientes}`
  );
}

async function generar(
  instruccion: string,
  partes?: Parte[],
  json = false,
  contenidos?: { role: string; parts: Parte[] }[],
): Promise<string> {
  if (!hayInternet()) throw new Error('El asistente necesita internet.');
  const clave = exigirGemini();
  const cuerpo = {
    systemInstruction: { parts: [{ text: instruccion }] },
    contents: contenidos ?? [{ role: 'user', parts: partes ?? [] }],
    generationConfig: {
      thinkingConfig: { thinkingLevel: 'LOW' },
      ...(json ? { responseMimeType: 'application/json' } : {}),
    },
  };
  const respuesta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${clave}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(cuerpo),
    },
  );
  const texto = await respuesta.text();
  if (!respuesta.ok) throw new Error(mensajeError(respuesta.status, texto));
  return textoDeRespuesta(texto);
}

function textoDeRespuesta(cuerpo: string): string {
  const json = JSON.parse(cuerpo) as {
    candidates?: { content?: { parts?: Parte[] } }[];
  };
  const partes = json.candidates?.[0]?.content?.parts ?? [];
  const textos = partes
    .filter((parte) => !parte.thought && parte.text?.trim())
    .map((parte) => parte.text!.trim());
  const ultimo = textos.at(-1);
  if (!ultimo) throw new Error('Gemini no devolvió un texto.');
  return ultimo;
}

function sugerenciaDesde(texto: string): SugerenciaGasto {
  const limpio = texto.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
  const json = JSON.parse(limpio) as {
    amount?: number | null;
    category?: string | null;
    description?: string;
    place?: string | null;
  };
  const nombre = json.category ?? '';
  const category =
    (esCategoria(nombre.toUpperCase()) ? (nombre.toUpperCase() as Categoria) : null) ??
    (Object.entries(CATEGORIA_ES).find(([, etiqueta]) => etiqueta.toLowerCase() === nombre.toLowerCase())?.[0] as
      | Categoria
      | undefined) ??
    null;
  const amount =
    json.amount == null || Number.isNaN(Number(json.amount)) || Number(json.amount) <= 0
      ? null
      : Number(json.amount);
  const lugar = json.place && json.place !== 'null' ? json.place : null;
  return {
    amount,
    category,
    description: json.description ?? '',
    placeLabel: lugar,
  };
}

function mensajeError(codigo: number, cuerpo: string): string {
  if (codigo === 400 || codigo === 403) return 'La clave de acceso no es válida. Revisá la configuración.';
  if (codigo === 429) return 'El asistente está recibiendo muchas consultas. Probá de nuevo en un rato.';
  if (codigo === 503) return 'El servidor tiene alta demanda en este momento. Por favor, intentá de nuevo en unos minutos.';
  if (codigo === 500) return 'Ocurrió un error en el servidor. Intentá más tarde.';
  if (cuerpo.toLowerCase().includes('network')) return 'No hay conexión. Revisá internet.';
  return 'Ocurrió un error inesperado. Por favor, intentá de nuevo.';
}
