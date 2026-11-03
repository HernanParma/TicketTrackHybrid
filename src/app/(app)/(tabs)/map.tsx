import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EsriMap } from '@/components/EsriMap';
import { useApp } from '@/context/AppProvider';
import { BUENOS_AIRES, CATEGORIA_COLOR, coordenadasValidas } from '@/model/expense';

export default function MapScreen() {
  const { colors, t, expenses, online } = useApp();
  const insets = useSafeAreaInsets();
  const conUbicacion = expenses.filter((gasto) => coordenadasValidas(gasto.latitude, gasto.longitude));
  const sinUbicacion = expenses.length - conUbicacion.length;
  const markers = useMemo(
    () =>
      expenses
        .filter((gasto) => coordenadasValidas(gasto.latitude, gasto.longitude))
        .map((gasto) => ({
          id: gasto.id,
          latitude: gasto.latitude as number,
          longitude: gasto.longitude as number,
          color: CATEGORIA_COLOR[gasto.category],
        })),
    [expenses],
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={{ flex: 1 }}>
        {online ? (
          <EsriMap
            latitude={markers[0]?.latitude ?? BUENOS_AIRES.latitude}
            longitude={markers[0]?.longitude ?? BUENOS_AIRES.longitude}
            markers={markers}
            onSelect={(id) => router.push(`/expense/${id}` as Href)}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ color: colors.text, textAlign: 'center' }}>{t.mapNeedsNet}</Text>
          </View>
        )}
      </View>
      <View style={{ padding: 16, paddingBottom: insets.bottom + 96, gap: 6, backgroundColor: colors.card }}>
        {conUbicacion.length === 0 ? <Text style={{ color: colors.muted }}>{t.mapCentered}</Text> : null}
        <Text style={{ color: colors.text, fontWeight: '700' }}>
          {t.mapOnMap(conUbicacion.length)} · {t.mapWithout(sinUbicacion)}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{t.mapCredit}</Text>
      </View>
    </View>
  );
}
