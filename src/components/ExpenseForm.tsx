import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, TextInput, View, useWindowDimensions } from 'react-native';

import { CategoryMark } from '@/components/CategoryMark';
import { EsriMap } from '@/components/EsriMap';
import { Button, Card, ErrorText, Muted, Screen, Title } from '@/components/ui';
import { useApp } from '@/context/AppProvider';
import { fechaLarga } from '@/model/dates';
import { CATEGORIAS, type Categoria } from '@/model/expense';
import { montoParaEditar, parseMonto } from '@/model/money';
import { interpretarFrase, leerTicket } from '@/services/gemini';
import { etiquetaDeLugar } from '@/services/geocoding';
import { comprimirTicket } from '@/services/photos';

export function ExpenseForm({ expenseId }: { expenseId?: string }) {
  const { colors, expenses, expensesReady, saveExpense, themeMode, t } = useApp();
  const { width } = useWindowDimensions();
  const isWeb = width >= 700;

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
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const geo = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDark = themeMode === 'OSCURO';

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
    if (Platform.OS === 'web') {
      setError(t.errDictationWeb);
      return;
    }
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
        setError(t.errMicPermission);
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
            setError(t.errMicFailed);
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
      modulo.start({ lang: t.speechLang, interimResults: true, continuous: false });
    } catch {
      setError(t.errDictationExpoGo);
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
      setError(causa instanceof Error ? causa.message : t.errInterpretExpense);
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
          setError(t.errCameraPermission);
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
      setError(causa instanceof Error ? causa.message : t.errReadPhoto);
    }
  };

  const completarFoto = async () => {
    if (!fotoNueva) return;
    setPensando(true);
    setError(null);
    try {
      aplicar(await leerTicket(fotoNueva.base64));
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : t.errReadTicket);
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
    setBuscandoUbicacion(true);
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (!permiso.granted) {
      setError(t.errLocationPermission);
      setBuscandoUbicacion(false);
      return;
    }
    try {
      const posicion = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      ponerLugar(posicion.coords.latitude, posicion.coords.longitude);
    } catch {
      setError(t.errGetLocation);
    } finally {
      setBuscandoUbicacion(false);
    }
  };

  const guardar = async () => {
    const amount = parseMonto(monto);
    if (amount <= 0) {
      setError(t.errAmountZero);
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
      setError(causa instanceof Error ? causa.message : t.errSaveExpense);
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
              <Button label={t.btnBackPlain} tone="ghost" onPress={() => router.back()} />
              <ErrorText>{t.errorExpenseNotFound}</ErrorText>
            </>
          ) : (
            <>
              <ActivityIndicator color={colors.primary} />
              <Muted>{t.loadingExpenseDetail}</Muted>
            </>
          )}
        </View>
      </Screen>
    );
  }

  const aiBg = isDark ? '#113224' : '#E8F5E9';
  const aiText = isDark ? '#A7D8C8' : '#004D40';
  const aiPlaceholder = isDark ? '#A7D8C880' : '#004D4080';
  const btnActionBg = isDark ? '#4A4458' : '#E0F2F1';
  const btnActionText = isDark ? '#E8DEF8' : '#00695C';
  const btnArmarBg = isDark ? '#214F3D' : '#B2DFDB';
  const btnArmarText = isDark ? '#A7D8C8' : '#004D40';

  const separador = <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 4 }} />;

  if (isWeb) {
    const deshabilitadoGuardar = guardando || parseMonto(monto) <= 0;

    return (
      <Screen scroll>
        <View style={{ width: '100%', flex: 1, paddingHorizontal: 12, paddingTop: 4, paddingBottom: 24, gap: 18 }}>
          {/* Barra superior con título y acción principal */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Pressable
                onPress={() => router.back()}
                style={{
                  paddingVertical: 9,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  backgroundColor: colors.card,
                }}>
                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>{t.btnBack}</Text>
              </Pressable>
              <Title>{expenseId ? t.editExpenseTitle : t.newExpenseTitle}</Title>
            </View>

            <Pressable
              disabled={deshabilitadoGuardar}
              onPress={() => void guardar()}
              style={{
                backgroundColor: deshabilitadoGuardar ? (isDark ? '#333' : '#CFD8DC') : colors.primary,
                paddingHorizontal: 28,
                height: 46,
                borderRadius: 23,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: deshabilitadoGuardar ? (isDark ? '#777' : '#78909C') : colors.onPrimary,
                  fontWeight: '700',
                  fontSize: 15,
                }}>
                {guardando ? t.btnSaving : expenseId ? t.btnSaveChanges : t.btnSaveExpense}
              </Text>
            </Pressable>
          </View>

          {error ? <ErrorText>{error}</ErrorText> : null}

          {/* Dos columnas simétricas y de altura equilibrada */}
          <View style={{ flexDirection: 'row', gap: 20, alignItems: 'stretch' }}>
            {/* Columna izquierda: Asistente + Datos del gasto */}
            <View style={{ flex: 1, gap: 18 }}>
              <View style={{ gap: 8 }}>
                <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 6, fontSize: 16 }}>{t.quickAssistantTitle}</Text>
                <Card style={{ backgroundColor: aiBg, padding: 18, gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialIcons name="auto-awesome" size={22} color={aiText} />
                    <Text style={{ color: aiText, fontSize: 15, fontWeight: '500' }}>{t.quickAssistantDesc}</Text>
                  </View>
                  <TextInput
                    value={frase}
                    onChangeText={setFrase}
                    placeholder={t.quickAssistantPlaceholder}
                    placeholderTextColor={aiPlaceholder}
                    style={{ color: isDark ? '#FFF' : '#004D40', fontSize: 16, minHeight: 40, paddingHorizontal: 4 }}
                  />
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Pressable
                      onPress={() => void dictar()}
                      style={{ flex: 1, backgroundColor: btnActionBg, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
                      <MaterialIcons name="mic" size={20} color={btnActionText} />
                      <Text style={{ color: btnActionText, fontWeight: 'bold', fontSize: 15 }}>{escuchando ? t.btnListening : t.btnDictate}</Text>
                    </Pressable>
                    <Pressable
                      disabled={!frase.trim() || pensando}
                      onPress={() => void armar()}
                      style={{ flex: 1, backgroundColor: frase.trim() ? btnArmarBg : (isDark ? '#333' : '#CFD8DC'), height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: frase.trim() ? btnArmarText : (isDark ? '#666' : '#78909C'), fontWeight: 'bold', fontSize: 15 }}>{pensando ? t.btnThinking : t.btnBuild}</Text>
                    </Pressable>
                  </View>
                </Card>
              </View>

              <View style={{ flex: 1, gap: 8 }}>
                <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 6, fontSize: 16 }}>{t.expenseDataTitle}</Text>
                <Card style={{ flex: 1, paddingHorizontal: 18, paddingVertical: 12, justifyContent: 'space-between' }}>
                  <View style={{ paddingVertical: 6 }}>
                    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 4 }}>{t.labelAmount}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: colors.primary, fontSize: 44, fontWeight: '900' }}>$</Text>
                      <TextInput
                        value={monto}
                        onChangeText={setMonto}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={colors.muted}
                        style={{ color: colors.text, fontSize: 44, fontWeight: '900', flex: 1, paddingVertical: 0, marginLeft: 4 }}
                      />
                    </View>
                  </View>

                  {separador}

                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 12 }}>
                      <Pressable
                        onPress={() => setMostrarCategorias((valor) => !valor)}
                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
                        <CategoryMark category={categoria} size={38} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={{ color: colors.muted, fontSize: 13 }}>{t.labelCategory}</Text>
                          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{t.categories[categoria]}</Text>
                        </View>
                        <MaterialIcons name={mostrarCategorias ? 'arrow-drop-up' : 'arrow-drop-down'} size={24} color={colors.text} />
                      </Pressable>

                      <View style={{ width: 1, backgroundColor: colors.line, marginVertical: 8 }} />

                      <Pressable
                        onPress={() => setMostrarFecha(true)}
                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingLeft: 4 }}>
                        <MaterialIcons name="calendar-month" size={24} color={colors.primary} style={{ marginRight: 12 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.muted, fontSize: 13 }}>{t.labelDate}</Text>
                          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }} numberOfLines={1}>
                            {fechaLarga(fecha)}
                          </Text>
                        </View>
                      </Pressable>
                    </View>

                    {mostrarCategorias ? (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 10, paddingTop: 4 }}>
                        {CATEGORIAS.map((item) => {
                          const activa = item === categoria;
                          return (
                            <Pressable
                              key={item}
                              onPress={() => {
                                setCategoria(item);
                                setMostrarCategorias(false);
                              }}
                              style={{
                                width: '48.5%',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10,
                                paddingVertical: 8,
                                paddingHorizontal: 10,
                                borderRadius: 14,
                                backgroundColor: activa ? `${colors.primary}18` : colors.background,
                              }}>
                              <CategoryMark category={item} size={30} />
                              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{t.categories[item]}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : null}

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
                  </View>

                  {separador}

                  <TextInput
                    value={nota}
                    onChangeText={setNota}
                    placeholder={t.noteOptionalPlaceholder}
                    placeholderTextColor={colors.muted}
                    multiline
                    style={{
                      color: colors.text,
                      fontSize: 16,
                      paddingVertical: 12,
                      minHeight: 72,
                      textAlignVertical: 'top',
                    }}
                  />
                </Card>
              </View>
            </View>

            {/* Columna derecha: Comprobante y Lugar con altura constante */}
            <View style={{ flex: 1, gap: 18 }}>
              <View style={{ gap: 8 }}>
                <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 6, fontSize: 16 }}>{t.receiptTitle}</Text>
                <Card style={{ padding: 16, gap: 12 }}>
                  <View
                    style={{
                      height: 150,
                      borderRadius: 16,
                      backgroundColor: colors.background,
                      overflow: 'hidden',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: fotoUri ? 0 : 1,
                      borderStyle: 'dashed',
                      borderColor: colors.line,
                    }}>
                    {fotoUri ? (
                      <Image source={{ uri: fotoUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    ) : (
                      <MaterialIcons name="receipt-long" size={38} color={colors.muted} style={{ opacity: 0.45 }} />
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Pressable
                      onPress={() => void elegirFoto('camara')}
                      style={{ flex: 1, backgroundColor: btnActionBg, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
                      <MaterialIcons name="photo-camera" size={20} color={btnActionText} />
                      <Text style={{ color: btnActionText, fontWeight: 'bold', fontSize: 15 }}>{t.btnCamera}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void elegirFoto('galeria')}
                      style={{ flex: 1, backgroundColor: btnActionBg, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
                      <MaterialIcons name="photo-library" size={20} color={btnActionText} />
                      <Text style={{ color: btnActionText, fontWeight: 'bold', fontSize: 15 }}>{t.btnGallery}</Text>
                    </Pressable>
                    {fotoNueva ? (
                      <Pressable
                        disabled={pensando}
                        onPress={() => void completarFoto()}
                        style={{
                          flex: 1.3,
                          backgroundColor: colors.primary,
                          height: 44,
                          borderRadius: 22,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                          gap: 6,
                          paddingHorizontal: 12,
                          opacity: pensando ? 0.7 : 1,
                        }}>
                        <MaterialIcons name="auto-awesome" size={18} color={colors.onPrimary} />
                        <Text style={{ color: colors.onPrimary, fontWeight: 'bold', fontSize: 14 }} numberOfLines={1}>
                          {pensando ? t.btnReadingTicket : t.btnCompleteWithPhoto}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </Card>
              </View>

              <View style={{ flex: 1, gap: 8 }}>
                <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 6, fontSize: 16 }}>{t.placeTitle}</Text>
                <Card style={{ flex: 1, padding: 16, gap: 12, justifyContent: 'space-between' }}>
                  <View
                    style={{
                      height: 165,
                      borderRadius: 16,
                      backgroundColor: colors.background,
                      overflow: 'hidden',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: latitud != null && longitud != null ? 0 : 1,
                      borderStyle: 'dashed',
                      borderColor: colors.line,
                    }}>
                    {latitud != null && longitud != null ? (
                      <>
                        <EsriMap latitude={latitud} longitude={longitud} selectable onMove={ponerLugar} />
                        {lugar ? (
                          <View
                            pointerEvents="none"
                            style={{
                              position: 'absolute',
                              bottom: 10,
                              left: 10,
                              maxWidth: '72%',
                              backgroundColor: colors.card,
                              opacity: 0.95,
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 14,
                              shadowColor: '#000',
                              shadowOpacity: 0.14,
                              shadowRadius: 4,
                              shadowOffset: { width: 0, height: 2 },
                              elevation: 3,
                            }}>
                            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }} numberOfLines={1}>
                              {lugar}
                            </Text>
                          </View>
                        ) : null}
                      </>
                    ) : (
                      <MaterialIcons name="place" size={38} color={colors.muted} style={{ opacity: 0.45 }} />
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Pressable
                      disabled={buscandoUbicacion}
                      onPress={() => void usarUbicacion()}
                      style={{
                        flex: 1,
                        backgroundColor: buscandoUbicacion ? (isDark ? '#333' : '#E0E0E0') : btnActionBg,
                        height: 44,
                        borderRadius: 22,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 8,
                      }}>
                      <MaterialIcons name="my-location" size={20} color={buscandoUbicacion ? '#9E9E9E' : btnActionText} />
                      <Text style={{ color: buscandoUbicacion ? '#9E9E9E' : btnActionText, fontWeight: 'bold', fontSize: 15 }}>
                        {buscandoUbicacion ? t.btnSearchingLocation : t.btnUseLocation}
                      </Text>
                    </Pressable>

                    {latitud != null && longitud != null ? (
                      <Pressable
                        onPress={() => {
                          setLatitud(null);
                          setLongitud(null);
                          setLugar('');
                        }}
                        style={{
                          width: 44,
                          backgroundColor: isDark ? '#4A3232' : '#FFEBEE',
                          height: 44,
                          borderRadius: 22,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <MaterialIcons name="delete" size={22} color="#E57373" />
                      </Pressable>
                    ) : null}
                  </View>
                </Card>
              </View>
            </View>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={{ width: '100%', flex: 1, gap: 24 }}>
        <Pressable onPress={() => router.back()} style={{ alignSelf: 'flex-start', paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>{t.btnBack}</Text>
        </Pressable>
        <Title>{expenseId ? t.editExpenseTitle : t.newExpenseTitle}</Title>

        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 6, fontSize: 16 }}>{t.quickAssistantTitle}</Text>
          <Card style={{ backgroundColor: aiBg, padding: 18, gap: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialIcons name="auto-awesome" size={24} color={aiText} />
              <Text style={{ color: aiText, fontSize: 15, fontWeight: '500' }}>{t.quickAssistantDesc}</Text>
            </View>
            <TextInput
              value={frase}
              onChangeText={setFrase}
              placeholder={t.quickAssistantPlaceholder}
              placeholderTextColor={aiPlaceholder}
              style={{ color: isDark ? '#FFF' : '#004D40', fontSize: 16, minHeight: 44, paddingHorizontal: 4 }}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => void dictar()}
                style={{ flex: 1, backgroundColor: btnActionBg, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
                <MaterialIcons name="mic" size={20} color={btnActionText} />
                <Text style={{ color: btnActionText, fontWeight: 'bold', fontSize: 15 }}>{escuchando ? t.btnListening : t.btnDictate}</Text>
              </Pressable>
              <Pressable
                disabled={!frase.trim() || pensando}
                onPress={() => void armar()}
                style={{ flex: 1, backgroundColor: frase.trim() ? btnArmarBg : (isDark ? '#333' : '#CFD8DC'), height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: frase.trim() ? btnArmarText : (isDark ? '#666' : '#78909C'), fontWeight: 'bold', fontSize: 15 }}>{pensando ? t.btnThinking : t.btnBuild}</Text>
              </Pressable>
            </View>
          </Card>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 6, fontSize: 16 }}>{t.expenseDataTitle}</Text>
          <Card style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
            <View style={{ paddingVertical: 12 }}>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 4 }}>{t.labelAmount}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: colors.primary, fontSize: 44, fontWeight: '900' }}>$</Text>
                <TextInput
                  value={monto}
                  onChangeText={setMonto}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  style={{ color: colors.text, fontSize: 44, fontWeight: '900', flex: 1, paddingVertical: 0, marginLeft: 4 }}
                />
              </View>
            </View>

            {separador}

            <Pressable
              onPress={() => setMostrarCategorias((valor) => !valor)}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
              <CategoryMark category={categoria} size={40} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: colors.muted, fontSize: 13 }}>{t.labelCategory}</Text>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{t.categories[categoria]}</Text>
              </View>
              <MaterialIcons name={mostrarCategorias ? 'arrow-drop-up' : 'arrow-drop-down'} size={24} color={colors.text} />
            </Pressable>

            {mostrarCategorias ? (
              <View style={{ paddingBottom: 8 }}>
                {CATEGORIAS.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setCategoria(item);
                      setMostrarCategorias(false);
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
                    <CategoryMark category={item} size={36} />
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{t.categories[item]}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {separador}

            <TextInput
              value={nota}
              onChangeText={setNota}
              placeholder={t.noteOptionalPlaceholder}
              placeholderTextColor={colors.muted}
              style={{ color: colors.text, fontSize: 16, paddingVertical: 18 }}
            />

            {separador}

            <Pressable
              onPress={() => setMostrarFecha(true)}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
              <MaterialIcons name="calendar-month" size={24} color={colors.primary} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.muted, fontSize: 13 }}>{t.labelDate}</Text>
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{fechaLarga(fecha)}</Text>
              </View>
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
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 6, fontSize: 16 }}>{t.receiptTitle}</Text>
          <Card style={{ padding: 18, gap: 16 }}>
            {fotoUri ? (
              <Image source={{ uri: fotoUri }} style={{ width: '100%', height: 180, borderRadius: 16 }} contentFit="cover" />
            ) : null}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => void elegirFoto('camara')}
                style={{ flex: 1, backgroundColor: btnActionBg, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
                <MaterialIcons name="photo-camera" size={20} color={btnActionText} />
                <Text style={{ color: btnActionText, fontWeight: 'bold', fontSize: 15 }}>{t.btnCamera}</Text>
              </Pressable>
              <Pressable
                onPress={() => void elegirFoto('galeria')}
                style={{ flex: 1, backgroundColor: btnActionBg, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
                <MaterialIcons name="photo-library" size={20} color={btnActionText} />
                <Text style={{ color: btnActionText, fontWeight: 'bold', fontSize: 15 }}>{t.btnGallery}</Text>
              </Pressable>
            </View>
            {fotoNueva ? (
              <Pressable
                disabled={pensando}
                onPress={() => void completarFoto()}
                style={{
                  backgroundColor: colors.primary,
                  height: 48,
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                  opacity: pensando ? 0.7 : 1,
                }}>
                <MaterialIcons name="auto-awesome" size={20} color={colors.onPrimary} />
                <Text style={{ color: colors.onPrimary, fontWeight: 'bold', fontSize: 16 }}>
                  {pensando ? t.btnReadingTicket : t.btnCompleteWithPhoto}
                </Text>
              </Pressable>
            ) : null}
          </Card>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={{ color: colors.text, fontWeight: '700', marginLeft: 6, fontSize: 16 }}>{t.placeTitle}</Text>
          <Card style={{ padding: 18, gap: 16 }}>
            {latitud != null && longitud != null ? (
              <>
                {lugar ? <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{lugar}</Text> : null}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Pressable
                    disabled={buscandoUbicacion}
                    onPress={() => void usarUbicacion()}
                    style={{ flex: 1, backgroundColor: buscandoUbicacion ? (isDark ? '#333' : '#E0E0E0') : btnActionBg, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
                    <MaterialIcons name="my-location" size={20} color={buscandoUbicacion ? '#9E9E9E' : btnActionText} />
                    <Text style={{ color: buscandoUbicacion ? '#9E9E9E' : btnActionText, fontWeight: 'bold', fontSize: 15 }}>
                      {buscandoUbicacion ? t.btnSearchingLocation : t.btnUseLocation}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { setLatitud(null); setLongitud(null); setLugar(''); }}
                    style={{ width: 64, backgroundColor: isDark ? '#4A3232' : '#FFEBEE', height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialIcons name="delete" size={24} color="#E57373" />
                  </Pressable>
                </View>
                <View style={{ height: 180, borderRadius: 16, overflow: 'hidden' }}>
                  <EsriMap latitude={latitud} longitude={longitud} selectable onMove={ponerLugar} />
                </View>
                <Muted>{t.mapAdjustHint}</Muted>
              </>
            ) : (
              <Pressable
                disabled={buscandoUbicacion}
                onPress={() => void usarUbicacion()}
                style={{ backgroundColor: buscandoUbicacion ? (isDark ? '#333' : '#E0E0E0') : btnActionBg, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
                <MaterialIcons name="my-location" size={20} color={buscandoUbicacion ? '#9E9E9E' : btnActionText} />
                <Text style={{ color: buscandoUbicacion ? '#9E9E9E' : btnActionText, fontWeight: 'bold', fontSize: 15 }}>
                  {buscandoUbicacion ? t.btnSearchingLocation : t.btnUseLocation}
                </Text>
              </Pressable>
            )}
          </Card>
        </View>

        <ErrorText>{error}</ErrorText>
        <View style={{ height: 60, marginTop: 8, marginBottom: 40 }}>
          <Button
            label={guardando ? t.btnSaving : expenseId ? t.btnSaveChanges : t.btnSaveExpense}
            disabled={guardando || parseFloat(monto) <= 0}
            onPress={() => void guardar()}
          />
        </View>
      </View>
    </Screen>
  );
}