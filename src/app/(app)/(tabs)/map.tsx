import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EsriMap } from '@/components/EsriMap';
import { useApp } from '@/context/AppProvider';
import { BUENOS_AIRES, CATEGORIA_COLOR, coordenadasValidas } from '@/model/expense';

export default function MapScreen() {
  const { colors, t, expenses, expensesReady, online } = useApp();
  const insets = useSafeAreaInsets();

  const conUbicacion = useMemo(
    () => expenses.filter((gasto) => coordenadasValidas(gasto.latitude, gasto.longitude)),
    [expenses],
  );

  const markers = useMemo(
    () =>
      conUbicacion.map((gasto) => ({
        id: gasto.id,
        latitude: gasto.latitude as number,
        longitude: gasto.longitude as number,
        color: CATEGORIA_COLOR[gasto.category],
      })),
    [conUbicacion],
  );

  const aviso = conUbicacion.length === 0
    ? t.mapNoLocation
    : t.mapTapMarker;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={{ flex: 1 }}>
        {!online ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ color: colors.text, textAlign: 'center' }}>{t.mapNeedsNet}</Text>
          </View>
        ) : expensesReady ? (
          <EsriMap
            latitude={markers[0]?.latitude ?? BUENOS_AIRES.latitude}
            longitude={markers[0]?.longitude ?? BUENOS_AIRES.longitude}
            markers={markers}
            onSelect={(id) => router.push(`/expense/${id}` as Href)}
          />
        ) : null}
      </View>

      {online ? (
        <View
          style={{
            position: 'absolute',
            bottom: insets.bottom + 96,
            alignSelf: 'center',
            width: '90%',
            maxWidth: 400,
            backgroundColor: colors.card,
            opacity: 0.95,
            borderRadius: 24,
            paddingVertical: 12,
            paddingHorizontal: 16,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 6,
          }}>
          <Text style={{ color: colors.text, fontWeight: '700', textAlign: 'center', fontSize: 15 }}>
            {aviso}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
            {t.mapCredit}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
