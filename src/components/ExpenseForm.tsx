import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { CategoryMark } from '@/components/CategoryMark';
import { EsriMap } from '@/components/EsriMap';
import { Button, Card, ErrorText, Muted, Screen, Title } from '@/components/ui';
import { useApp } from '@/context/AppProvider';
import { CATEGORIA_ES, CATEGORIAS, type Categoria } from '@/model/expense';
import { fechaLarga } from '@/model/dates';
import { montoParaEditar, parseMonto } from '@/model/money';
import { etiquetaDeLugar } from '@/services/geocoding';
import { interpretarFrase, leerTicket } from '@/services/gemini';
import { comprimirTicket } from '@/services/photos';

export function ExpenseForm({ expenseId }: { expenseId?: string }) {
  const { colors, expenses, expensesReady, saveExpense } = useApp();
  const existente = expenseId ? expenses.find((gasto) => gasto.id === expenseId) : undefined;
  const cargado = useRef(false);
  const [frase, setFrase] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('OTROS');
  const [nota, setNota] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [mostrarFecha, setMostrarFecha] = useState(false);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [fotoNueva, setFotoNueva] = useState<{ uri: string; base64: string } | null>(null);
  const [latitud, setLatitud] = useState<number | null>(null);
  const [longitud, setLongitud] = useState<number | null>(null);
  const [lugar, setLugar] = useState('');
  const [escuchando, setEscuchando] = useState(false);
  const [pensando, setPensando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const geo = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!existente || cargado.current) return;
    cargado.current = true;
    setMonto(montoParaEditar(existente.amount));
    setCategoria(existente.category);
    setNota(existente.description);
    setFecha(existente.createdAt);
    setFotoUri(existente.photoUrl);
    setFotoNueva(null);
    setLatitud(existente.latitude);
    setLongitud(existente.longitude);
    setLugar(existente.placeLabel ?? '');
  }, [existente]);

  const aplicar = (sugerencia: {
    amount: number | null;
    category: Categoria | null;
    description: string;
    placeLabel: string | null;
  }) => {
    if (sugerencia.amount != null) setMonto(montoParaEditar(sugerencia.amount));
    if (sugerencia.category) setCategoria(sugerencia.category);
    if (sugerencia.description.trim()) setNota(sugerencia.description);
    if (sugerencia.placeLabel) setLugar(sugerencia.placeLabel);
  };

  const dictar = async () => {
    setError(null);
    try {
      const speech = await import('expo-speech-recognition');
      const modulo = speech.ExpoSpeechRecognitionModule;
      if (escuchando) {
        modulo.stop();
        setEscuchando(false);
        return;
      }
      const permiso = await modulo.requestPermissionsAsync();
      if (!permiso.granted) {
        setError('Activá el micrófono y el reconocimiento de voz para dictar.');
        return;
      }
      const suscripciones: { remove: () => void }[] = [];
      suscripciones.push(
        modulo.addListener('result', (event) => {
          const texto = event.results[0]?.transcript;
          if (texto) setFrase(texto);
        }),
      );
      suscripciones.push(
        modulo.addListener('error', (event) => {
          if (event.error !== 'aborted' && event.error !== 'no-speech') {
            setError('No se pudo usar el micrófono. Escribí la frase.');
          }
          setEscuchando(false);
        }),
      );
      suscripciones.push(
        modulo.addListener('end', () => {
          setEscuchando(false);
          suscripciones.forEach((item) => item.remove());
        }),
      );
      setEscuchando(true);
      modulo.start({ lang: 'es-AR', interimResults: true, continuous: false });
    } catch {
      setError('El reconocedor de voz del sistema no está disponible. Escribí la frase.');
      setEscuchando(false);
    }
  };

  const armar = async () => {
    const texto = frase.trim();
    if (!texto) return;
    setPensando(true);
    setError(null);
    try {
      aplicar(await interpretarFrase(texto));
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo interpretar el gasto');
    } finally {
      setPensando(false);
    }
  };

  const elegirFoto = async (origen: 'camara' | 'galeria') => {
    setError(null);
    try {
      if (origen === 'camara') {
        const permiso = await ImagePicker.requestCameraPermissionsAsync();
        if (!permiso.granted) {
          setError('Activá la cámara para fotografiar el ticket.');
          return;
        }
      }
      const resultado =
        origen === 'camara'
          ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      if (resultado.canceled || !resultado.assets[0]) return;
      const comprimida = await comprimirTicket(resultado.assets[0].uri);
      setFotoUri(comprimida.uri);
      setFotoNueva(comprimida);
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo leer la foto');
    }
  };

  const completarFoto = async () => {
    if (!fotoNueva) return;
    setPensando(true);
    setError(null);
    try {
      aplicar(await leerTicket(fotoNueva.base64));
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo leer el ticket');
    } finally {
      setPensando(false);
    }
  };

  const ponerLugar = (lat: number, lng: number) => {
    setLatitud(lat);
    setLongitud(lng);
    if (geo.current) clearTimeout(geo.current);
    geo.current = setTimeout(() => {
      void etiquetaDeLugar(lat, lng).then((nombre) => {
        if (nombre) setLugar(nombre);
      });
    }, 400);
  };

  const usarUbicacion = async () => {
    setError(null);
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (!permiso.granted) {
      setError('Activá la ubicación precisa para guardar el lugar.');
      return;
    }
    try {
      const posicion = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      ponerLugar(posicion.coords.latitude, posicion.coords.longitude);
    } catch {
      setError('No se pudo obtener la ubicación.');
    }
  };

  const guardar = async () => {
    const amount = parseMonto(monto);
    if (amount <= 0) {
      setError('El monto tiene que ser mayor que 0.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await saveExpense(expenseId ?? null, {
        amount,
        category: categoria,
        description: nota,
        photo: fotoNueva,
        existingPhotoUrl: fotoNueva ? null : existente?.photoUrl ?? null,
        latitude: latitud,
        longitude: longitud,
        placeLabel: lugar,
        createdAt: fecha,
      });
      router.back();
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : 'No se pudo guardar el gasto');
    } finally {
      setGuardando(false);
    }
  };

  if (expenseId && !existente) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          {expensesReady ? (
            <>
              <Button label="Volver" tone="ghost" onPress={() => router.back()} />
              <ErrorText>No encontramos ese gasto.</ErrorText>
            </>
          ) : (
            <>
              <ActivityIndicator color={colors.primary} />
              <Muted>Cargando gasto...</Muted>
            </>
          )}
        </View>
      </Screen>
    );
  }

  const caja = {
    backgroundColor: colors.input,
    color: colors.text,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 15,
  };

  return (
    <Screen scroll>
      <View style={{ width: '100%', gap: 10 }}>
        <Pressable onPress={() => router.back()} style={{ alignSelf: 'flex-start' }}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Volver</Text>
        </Pressable>
        <Title>{expenseId ? 'Editar gasto' : 'Nuevo gasto'}</Title>

        <Card style={{ backgroundColor: colors.primary, padding: 14, gap: 10 }}>
          <Text style={{ color: colors.onPrimary, fontSize: 16, fontWeight: '700' }}>Con una frase</Text>
          <TextInput
            value={frase}
            onChangeText={setFrase}
            placeholder="Gasté 4500 en el súper"
            placeholderTextColor={`${colors.onPrimary}99`}
            style={{
              color: colors.onPrimary,
              fontSize: 15,
              height: 44,
              borderRadius: 12,
              paddingHorizontal: 12,
              backgroundColor: 'rgba(255,255,255,0.16)',
            }}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button compact label={escuchando ? 'Escuchando...' : 'Dictar'} tone="ghost" onPress={() => void dictar()} />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                compact
                label={pensando ? 'Pensando...' : 'Armar'}
                tone="ghost"
                disabled={!frase.trim() || pensando}
                onPress={() => void armar()}
              />
            </View>
          </View>
          <Text style={{ color: colors.onPrimary, fontSize: 13 }}>Revisá los datos antes de guardar.</Text>
        </Card>

        <Card style={{ padding: 14, gap: 10 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>Datos del gasto</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: 56,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.line,
              backgroundColor: colors.input,
              paddingHorizontal: 14,
            }}>
            <Text style={{ color: colors.primary, fontSize: 26, fontWeight: '800' }}>$</Text>
            <TextInput
              value={monto}
              onChangeText={setMonto}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.muted}
              style={{
                color: colors.text,
                fontSize: 26,
                fontWeight: '800',
                flex: 1,
                height: 44,
                marginLeft: 6,
                paddingVertical: 0,
              }}
            />
          </View>
          <Pressable
            onPress={() => setMostrarCategorias((valor) => !valor)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: colors.input,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.line,
              paddingHorizontal: 10,
              height: 48,
            }}>
            <CategoryMark category={categoria} size={28} />
            <Text style={{ color: colors.text, fontSize: 15, flex: 1 }}>{CATEGORIA_ES[categoria]}</Text>
          </Pressable>
          {mostrarCategorias ? (
            <View style={{ gap: 4 }}>
              {CATEGORIAS.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => {
                    setCategoria(item);
                    setMostrarCategorias(false);
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}>
                  <CategoryMark category={item} size={28} />
                  <Text style={{ color: colors.text }}>{CATEGORIA_ES[item]}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          <TextInput
            value={nota}
            onChangeText={setNota}
            placeholder="Nota (opcional)"
            placeholderTextColor={colors.muted}
            style={caja}
          />
          <Pressable
            onPress={() => setMostrarFecha(true)}
            style={{
              backgroundColor: colors.input,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.line,
              paddingHorizontal: 12,
              paddingVertical: 8,
              justifyContent: 'center',
            }}>
            <Muted>Fecha</Muted>
            <Text style={{ color: colors.text, fontSize: 15 }}>{fechaLarga(fecha)}</Text>
          </Pressable>
          {mostrarFecha ? (
            <DateTimePicker
              value={fecha}
              mode="date"
              onChange={(_event, elegida) => {
                setMostrarFecha(false);
                if (elegida) setFecha(elegida);
              }}
            />
          ) : null}
        </Card>

        <Card style={{ padding: 14, gap: 10 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>Comprobante</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button compact label="Cámara" tone="ghost" onPress={() => void elegirFoto('camara')} />
            </View>
            <View style={{ flex: 1 }}>
              <Button compact label="Galería" tone="ghost" onPress={() => void elegirFoto('galeria')} />
            </View>
          </View>
          {fotoUri ? (
            <Image
              source={{ uri: fotoUri }}
              style={{ width: '100%', height: 160, borderRadius: 14 }}
              contentFit="cover"
            />
          ) : (
            <View
              style={{
                height: 64,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.line,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.input,
              }}>
              <Muted>Sin comprobante</Muted>
            </View>
          )}
          {fotoNueva ? (
            <Button
              compact
              label={pensando ? 'Leyendo ticket...' : 'Completar con la foto'}
              disabled={pensando}
              onPress={() => void completarFoto()}
            />
          ) : null}
        </Card>

        <Card style={{ padding: 14, gap: 10 }}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>Lugar</Text>
          <Button compact label="Usar mi ubicación" tone="ghost" onPress={() => void usarUbicacion()} />
          {latitud != null && longitud != null ? (
            <View style={{ height: 168, borderRadius: 14, overflow: 'hidden' }}>
              <EsriMap latitude={latitud} longitude={longitud} selectable onMove={ponerLugar} />
            </View>
          ) : null}
          <Muted>Tocá el mapa para ajustar el punto.</Muted>
          <TextInput
            value={lugar}
            onChangeText={setLugar}
            placeholder="Calle, ciudad"
            placeholderTextColor={colors.muted}
            style={caja}
          />
        </Card>

        <ErrorText>{error}</ErrorText>
        <Button
          label={guardando ? 'Guardando...' : expenseId ? 'Guardar cambios' : 'Guardar'}
          disabled={guardando}
          onPress={() => void guardar()}
        />
      </View>
    </Screen>
  );
}
