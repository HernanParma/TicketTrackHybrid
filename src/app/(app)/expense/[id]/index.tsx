import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';

import { EsriMap } from '@/components/EsriMap';
import { Button, Card, Muted, Screen } from '@/components/ui';
import { useApp } from '@/context/AppProvider';
import { coordenadasValidas, textoUbicacion } from '@/model/expense';
import { formatoPesos } from '@/model/money';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, expenses, expensesReady, removeExpense, themeMode, t } = useApp();
  const { width } = useWindowDimensions();
  const isWeb = width >= 700;

  const gastoEncontrado = expenses.find((item) => item.id === id);
  const gastoRef = useRef(gastoEncontrado);
  if (gastoEncontrado) {
    gastoRef.current = gastoEncontrado;
  }
  const gasto = gastoRef.current;

  const [fotoAbierta, setFotoAbierta] = useState(false);
  const [borrando, setBorrando] = useState(false);

  if (!gasto) {
    return (
      <Screen>
        <View style={{ paddingHorizontal: 16, width: '100%' }}>
          <Pressable onPress={() => router.back()} style={{ paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>{t.btnBack}</Text>
          </Pressable>
          <Muted>{expensesReady ? t.errorExpenseNotFound : t.loadingExpenseDetail}</Muted>
        </View>
      </Screen>
    );
  }

  const lugar = textoUbicacion(gasto.placeLabel, gasto.latitude, gasto.longitude);
  const tieneMapa = coordenadasValidas(gasto.latitude, gasto.longitude);
  const tieneFoto = Boolean(gasto.photoUrl);
  const tieneLugar = Boolean(lugar || tieneMapa);
  const tieneNota = Boolean(gasto.description.trim());
  const ambosMedios = tieneFoto && tieneLugar;
  const soloUnMedioConNota = !ambosMedios && (tieneFoto || tieneLugar) && tieneNota;
  const soloFotoAislada = tieneFoto && !tieneLugar && !tieneNota;

  const formatearFechaHora = (fecha: Date) => {
    const d = new Date(fecha);
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    const anio = d.getFullYear();
    const horas = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${anio} ${horas}:${min}`;
  };

  const ejecutarBorrado = () => {
    setBorrando(true);
    void removeExpense(gasto.id)
      .then(() => router.back())
      .catch(() => setBorrando(false));
  };

  const eliminar = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(`${t.dialogDeleteTitle}\n\n${t.dialogDeleteMessage}`)) {
        ejecutarBorrado();
      }
      return;
    }
    Alert.alert(t.dialogDeleteTitle, t.dialogDeleteMessage, [
      { text: t.btnCancel, style: 'cancel' },
      {
        text: t.btnDelete,
        style: 'destructive',
        onPress: ejecutarBorrado,
      },
    ]);
  };

  if (isWeb) {
    const isDark = themeMode === 'OSCURO';
    const heroTextColor = isDark ? '#000000' : colors.onPrimary;
    const heroSubColor = isDark ? 'rgba(0,0,0,0.78)' : 'rgba(255,255,255,0.88)';
    const heroPillBg = isDark ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.16)';

    const tarjetaNota = tieneNota ? (
      <Card style={{ flex: soloUnMedioConNota ? 1 : undefined, width: soloUnMedioConNota ? undefined : '100%', padding: 20, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialIcons name="notes" size={20} color={colors.primary} />
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{t.noteTitle}</Text>
        </View>
        <Text style={{ color: colors.text, fontSize: 16, lineHeight: 24 }}>
          {gasto.description.trim()}
        </Text>
      </Card>
    ) : null;

    const tarjetaFoto = tieneFoto ? (
      <Card style={{ flex: soloUnMedioConNota ? 1.45 : 1, padding: 18, gap: 12 }}>
        <View style={{ height: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialIcons name="receipt-long" size={20} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{t.receiptTitle}</Text>
          </View>
          <Muted>{t.zoomPhotoHint}</Muted>
        </View>
        <Pressable
          onPress={() => setFotoAbierta(true)}
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: soloFotoAislada ? colors.background : 'transparent',
          }}>
          <Image
            source={{ uri: gasto.photoUrl! }}
            style={{ width: '100%', height: soloFotoAislada ? 290 : 230 }}
            contentFit={soloFotoAislada ? 'contain' : 'cover'}
          />
        </Pressable>
      </Card>
    ) : null;

    const tarjetaLugar = tieneLugar ? (
      <Card style={{ flex: soloUnMedioConNota ? 1.45 : 1, padding: 18, gap: 12 }}>
        <View style={{ height: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialIcons name="place" size={20} color={colors.primary} />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{t.placeTitle}</Text>
          </View>
          {lugar ? (
            <Text style={{ color: colors.muted, fontSize: 14, fontWeight: '600', flexShrink: 1 }} numberOfLines={1}>
              {lugar}
            </Text>
          ) : null}
        </View>
        {tieneMapa ? (
          <View style={{ height: ambosMedios ? 230 : 250, borderRadius: 16, overflow: 'hidden' }}>
            <EsriMap
              latitude={gasto.latitude as number}
              longitude={gasto.longitude as number}
              zoom={15}
              markers={[
                {
                  id: gasto.id,
                  latitude: gasto.latitude as number,
                  longitude: gasto.longitude as number,
                  color: '#0C6B58',
                },
              ]}
            />
          </View>
        ) : null}
      </Card>
    ) : null;

    return (
      <Screen>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 18, paddingBottom: 32 }}>
          <View style={{ width: '100%', gap: 18 }}>
            {/* Barra superior */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
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

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Pressable
                  onPress={() => router.push(`/expense/${gasto.id}/edit` as Href)}
                  style={{
                    backgroundColor: colors.primary,
                    height: 42,
                    paddingHorizontal: 22,
                    borderRadius: 21,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                  <MaterialIcons name="edit" size={18} color={colors.onPrimary} />
                  <Text style={{ color: colors.onPrimary, fontWeight: '700', fontSize: 15 }}>{t.btnEdit}</Text>
                </Pressable>

                <Pressable
                  disabled={borrando}
                  onPress={eliminar}
                  style={{
                    height: 42,
                    paddingHorizontal: 20,
                    borderRadius: 21,
                    borderWidth: 1,
                    borderColor: borrando ? '#E0E0E0' : '#E57373',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: borrando ? '#F5F5F5' : colors.card,
                  }}>
                  <MaterialIcons name="delete-outline" size={19} color={borrando ? '#9E9E9E' : '#D32F2F'} />
                  <Text style={{ color: borrando ? '#9E9E9E' : '#D32F2F', fontWeight: '700', fontSize: 15 }}>
                    {borrando ? t.btnDeleting : t.btnDelete}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Tarjeta principal horizontal a 100% de ancho */}
            <View
              style={{
                width: '100%',
                backgroundColor: colors.primary,
                borderRadius: 26,
                paddingHorizontal: 28,
                paddingVertical: 22,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}>
              <View style={{ gap: 2 }}>
                <Text style={{ color: heroSubColor, fontSize: 16, fontWeight: '700' }}>
                  {t.categories[gasto.category]}
                </Text>
                <Text style={{ color: heroTextColor, fontSize: 46, fontWeight: '900' }}>
                  {formatoPesos(gasto.amount)}
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: heroPillBg,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}>
                <MaterialIcons name="schedule" size={18} color={heroTextColor} />
                <Text style={{ color: heroTextColor, fontSize: 15, fontWeight: '700' }}>
                  {formatearFechaHora(gasto.createdAt)}
                </Text>
              </View>
            </View>

            {/* Distribución dinámica según qué datos tenga el gasto */}
            {ambosMedios ? (
              <>
                {tarjetaNota}
                <View style={{ width: '100%', flexDirection: 'row', gap: 18, alignItems: 'stretch' }}>
                  {tarjetaFoto}
                  {tarjetaLugar}
                </View>
              </>
            ) : soloUnMedioConNota ? (
              <View style={{ width: '100%', flexDirection: 'row', gap: 18, alignItems: 'stretch' }}>
                {tarjetaNota}
                {tarjetaFoto}
                {tarjetaLugar}
              </View>
            ) : (
              <>
                {tarjetaNota}
                {tarjetaFoto}
                {tarjetaLugar}
              </>
            )}
          </View>
        </ScrollView>

        <Modal visible={fotoAbierta} transparent animationType="fade" onRequestClose={() => setFotoAbierta(false)}>
          <Pressable style={{ flex: 1, backgroundColor: '#000000EE', justifyContent: 'center', padding: 24 }} onPress={() => setFotoAbierta(false)}>
            {gasto.photoUrl ? (
              <Image source={{ uri: gasto.photoUrl }} style={{ width: '100%', height: '85%', borderRadius: 16 }} contentFit="contain" />
            ) : null}
          </Pressable>
        </Modal>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <View style={{ width: '100%', gap: 24 }}>
          <Pressable onPress={() => router.back()} style={{ alignSelf: 'flex-start', paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>{t.btnBack}</Text>
          </Pressable>

          <View style={{ backgroundColor: colors.primary, borderRadius: 24, padding: 22, gap: 4 }}>
            <Text style={{ color: themeMode === 'OSCURO' ? '#000000' : 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' }}>
              {t.categories[gasto.category]}
            </Text>
            <Text style={{ color: themeMode === 'OSCURO' ? '#000000' : colors.onPrimary, fontSize: 44, fontWeight: '900', marginVertical: 4 }}>
              {formatoPesos(gasto.amount)}
            </Text>
            <Text style={{ color: themeMode === 'OSCURO' ? '#000000' : 'rgba(255,255,255,0.85)', fontSize: 14 }}>
              {formatearFechaHora(gasto.createdAt)}
            </Text>
          </View>

          {gasto.description.trim() ? (
            <View style={{ gap: 8 }}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{t.noteTitle}</Text>
              <Text style={{ color: colors.text, fontSize: 16 }}>{gasto.description.trim()}</Text>
            </View>
          ) : null}

          {gasto.photoUrl ? (
            <View style={{ gap: 8 }}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{t.receiptTitle}</Text>
              <Pressable onPress={() => setFotoAbierta(true)}>
                <Image source={{ uri: gasto.photoUrl }} style={{ width: '100%', height: 220, borderRadius: 16 }} contentFit="cover" />
              </Pressable>
              <Muted>{t.zoomPhotoHint}</Muted>
            </View>
          ) : null}

          {lugar || tieneMapa ? (
            <View style={{ gap: 8 }}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{t.placeTitle}</Text>
              {lugar ? <Text style={{ color: colors.text, fontSize: 16 }}>{lugar}</Text> : null}
              {tieneMapa ? (
                <View style={{ height: 200, borderRadius: 16, overflow: 'hidden', marginTop: 4 }}>
                  <EsriMap latitude={gasto.latitude as number} longitude={gasto.longitude as number} zoom={15} markers={[{
                    id: gasto.id,
                    latitude: gasto.latitude as number,
                    longitude: gasto.longitude as number,
                    color: '#0C6B58',
                  }]} />
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, backgroundColor: colors.background }}>
        <View style={{ width: '100%', gap: 12 }}>
          <Button label={t.btnEdit} onPress={() => router.push(`/expense/${gasto.id}/edit` as Href)} />
          <Pressable
            disabled={borrando}
            onPress={eliminar}
            style={{
              height: 48,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: borrando ? '#E0E0E0' : '#E57373',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: borrando ? '#F5F5F5' : 'transparent'
            }}>
            <Text style={{ color: borrando ? '#9E9E9E' : '#D32F2F', fontWeight: 'bold', fontSize: 15 }}>
              {borrando ? t.btnDeleting : t.btnDelete}
            </Text>
          </Pressable>
        </View>
      </View>

      <Modal visible={fotoAbierta} transparent animationType="fade" onRequestClose={() => setFotoAbierta(false)}>
        <Pressable style={{ flex: 1, backgroundColor: '#000000EE', justifyContent: 'center', padding: 16 }} onPress={() => setFotoAbierta(false)}>
          {gasto.photoUrl ? (
            <Image source={{ uri: gasto.photoUrl }} style={{ width: '100%', height: '80%', borderRadius: 16 }} contentFit="contain" />
          ) : null}
        </Pressable>
      </Modal>
    </Screen>
  );
}