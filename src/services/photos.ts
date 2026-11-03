import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export async function comprimirTicket(uri: string): Promise<{ uri: string; base64: string }> {
  const contexto = ImageManipulator.manipulate(uri, { maxWidth: 1280, maxHeight: 1280 });
  const imagen = await contexto.renderAsync();
  const guardada = await imagen.saveAsync({
    compress: 0.8,
    format: SaveFormat.JPEG,
    base64: true,
  });
  if (!guardada.base64) throw new Error('No se pudo leer la foto');
  return { uri: guardada.uri, base64: guardada.base64 };
}
