import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';

import { CategoryMark } from '@/components/CategoryMark';
import { Card, Muted, Screen, Title } from '@/components/ui';
import { useApp } from '@/context/AppProvider';
import { mesConDesplazamiento } from '@/model/dates';
import { CATEGORIA_ES, textoUbicacion } from '@/model/expense';
import { formatoPesos } from '@/model/money';
import { resumenDelMes, textoComparacion } from '@/model/summary';

export default function SummaryScreen() {
  const { colors, expenses } = useApp();
  const [offset, setOffset] = useState(0);
  const fecha = mesConDesplazamiento(offset);
  const resumen = resumenDelMes(expenses, fecha);
  const lugar = resumen.mayor
    ? textoUbicacion(resumen.mayor.placeLabel, resumen.mayor.latitude, resumen.mayor.longitude)
    : null;

  return (
    <Screen scroll tabInset>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={() => setOffset((valor) => valor - 1)} hitSlop={12}>
          <Text style={{ color: colors.primary, fontSize: 28, fontWeight: '700' }}>‹</Text>
        </Pressable>
        <Title>{resumen.titulo}</Title>
        <Pressable disabled={offset === 0} onPress={() => setOffset((valor) => Math.min(0, valor + 1))} hitSlop={12}>
          <Text style={{ color: offset === 0 ? colors.muted : colors.primary, fontSize: 28, fontWeight: '700' }}>›</Text>
        </Pressable>
      </View>

      <Card style={{ backgroundColor: colors.primary }}>
        <Text style={{ color: colors.onPrimary }}>Total del mes</Text>
        <Text style={{ color: colors.onPrimary, fontSize: 34, fontWeight: '800' }}>{formatoPesos(resumen.total)}</Text>
        <Text style={{ color: colors.onPrimary }}>
          {resumen.cantidad === 1 ? '1 gasto' : `${resumen.cantidad} gastos`} · Promedio {formatoPesos(resumen.promedioDiario)}
        </Text>
      </Card>

      <Card>
        <Muted>Mes anterior</Muted>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>{formatoPesos(resumen.totalMesAnterior)}</Text>
        <Text style={{ color: colors.text }}>{textoComparacion(resumen.diferenciaMesAnterior)}</Text>
      </Card>

      {resumen.mayor ? (
        <Pressable onPress={() => router.push(`/expense/${resumen.mayor!.id}` as Href)}>
          <Card>
            <Muted>Mayor gasto</Muted>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <CategoryMark category={resumen.mayor.category} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>
                  {resumen.mayor.description.trim() || CATEGORIA_ES[resumen.mayor.category]}
                </Text>
                <Muted>
                  {CATEGORIA_ES[resumen.mayor.category]}
                  {lugar ? ` · ${lugar}` : ''}
                </Muted>
              </View>
              <Text style={{ color: colors.text, fontWeight: '800' }}>{formatoPesos(resumen.mayor.amount)}</Text>
            </View>
          </Card>
        </Pressable>
      ) : (
        <Muted>Sin movimientos registrados en este mes.</Muted>
      )}

      <Card>
        <Text style={{ color: colors.text, fontWeight: '700' }}>Por categoría</Text>
        {resumen.porCategoria.length === 0 ? <Muted>Sin movimientos registrados en este mes.</Muted> : null}
        {resumen.porCategoria.map((linea) => {
          const porcentaje = Math.round(linea.proporcion * 100);
          return (
            <View key={linea.categoria} style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <CategoryMark category={linea.categoria} size={32} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{CATEGORIA_ES[linea.categoria]}</Text>
                  <Muted>
                    {linea.cantidad === 1 ? '1 gasto' : `${linea.cantidad} gastos`} · {porcentaje}%
                  </Muted>
                </View>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{formatoPesos(linea.total)}</Text>
              </View>
              <View style={{ height: 8, borderRadius: 8, backgroundColor: colors.chip, overflow: 'hidden' }}>
                <View
                  style={{
                    width: `${Math.max(porcentaje, linea.total > 0 ? 4 : 0)}%`,
                    height: 8,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>
            </View>
          );
        })}
      </Card>
    </Screen>
  );
}
