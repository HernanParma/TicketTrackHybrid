import { useState } from 'react';
import { Alert, Modal, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, type Href } from 'expo-router';

import { CategoryMark } from '@/components/CategoryMark';
import { EsriMap } from '@/components/EsriMap';
import { Button, Card, Muted, Screen, Title } from '@/components/ui';
import { useApp } from '@/context/AppProvider';
import { fechaLarga } from '@/model/dates';
import { CATEGORIA_ES, coordenadasValidas, textoUbicacion } from '@/model/expense';
import { formatoPesos } from '@/model/money';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, expenses, expensesReady, removeExpense } = useApp();
  const gasto = expenses.find((item) => item.id === id);
  const [fotoAbierta, setFotoAbierta] = useState(false);
  const [borrando, setBorrando] = useState(false);

  if (!gasto) {
    return (
      <Screen>
        <Button label="Volver" tone="ghost" onPress={() => router.back()} />
        <Muted>{expensesReady ? 'No encontramos ese gasto.' : 'Cargando gasto...'}</Muted>
      </Screen>
    );
  }

  const lugar = textoUbicacion(gasto.placeLabel, gasto.latitude, gasto.longitude);
  const tieneMapa = coordenadasValidas(gasto.latitude, gasto.longitude);

  const eliminar = () => {
    Alert.alert('Eliminar gasto', 'Se va a borrar este gasto de tu listado.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          setBorrando(true);
          void removeExpense(gasto.id)
            .then(() => router.back())
            .catch(() => setBorrando(false));
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <Pressable onPress={() => router.back()}>
        <Text style={{ color: colors.primary, fontWeight: '700' }}>Volver</Text>
      </Pressable>
      <Card style={{ backgroundColor: colors.primary, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <CategoryMark category={gasto.category} />
          <Title light>{CATEGORIA_ES[gasto.category]}</Title>
        </View>
        <Text style={{ color: colors.onPrimary, fontSize: 36, fontWeight: '800' }}>{formatoPesos(gasto.amount)}</Text>
        <Text style={{ color: colors.onPrimary }}>{fechaLarga(gasto.createdAt)}</Text>
      </Card>

      <Card>
        <Muted>Nota</Muted>
        <Text style={{ color: colors.text, fontSize: 16 }}>{gasto.description.trim() || 'Sin nota'}</Text>
      </Card>

      <Card>
        <Muted>Comprobante</Muted>
        {gasto.photoUrl ? (
          <>
            <Pressable onPress={() => setFotoAbierta(true)}>
              <Image source={{ uri: gasto.photoUrl }} style={{ width: '100%', height: 220, borderRadius: 16 }} contentFit="cover" />
            </Pressable>
            <Muted>Tocá la foto para ampliarla</Muted>
          </>
        ) : (
          <Text style={{ color: colors.text }}>Sin comprobante</Text>
        )}
      </Card>

      {lugar || tieneMapa ? (
        <Card>
          <Muted>Lugar</Muted>
          {lugar ? <Text style={{ color: colors.text }}>{lugar}</Text> : null}
          {tieneMapa ? (
            <View style={{ height: 180, borderRadius: 16, overflow: 'hidden' }}>
              <EsriMap latitude={gasto.latitude as number} longitude={gasto.longitude as number} zoom={15} markers={[{
                id: gasto.id,
                latitude: gasto.latitude as number,
                longitude: gasto.longitude as number,
                color: '#0C6B58',
              }]} />
            </View>
          ) : null}
        </Card>
      ) : null}

      <Button label="Editar" onPress={() => router.push(`/expense/${gasto.id}/edit` as Href)} />
      <Button label={borrando ? 'Eliminando...' : 'Eliminar'} tone="danger" disabled={borrando} onPress={eliminar} />

      <Modal visible={fotoAbierta} transparent animationType="fade" onRequestClose={() => setFotoAbierta(false)}>
        <Pressable style={{ flex: 1, backgroundColor: '#000000EE', justifyContent: 'center' }} onPress={() => setFotoAbierta(false)}>
          {gasto.photoUrl ? (
            <Image source={{ uri: gasto.photoUrl }} style={{ width: '100%', height: '70%' }} contentFit="contain" />
          ) : null}
        </Pressable>
      </Modal>
    </Screen>
  );
}
