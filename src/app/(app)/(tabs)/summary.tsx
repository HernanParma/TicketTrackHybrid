import { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';

import { CategoryMark } from '@/components/CategoryMark';
import { Card, Screen, Title } from '@/components/ui';
import { useApp } from '@/context/AppProvider';
import { mesConDesplazamiento } from '@/model/dates';
import { CATEGORIA_COLOR } from '@/model/expense';
import { formatoPesos } from '@/model/money';
import { resumenDelMes } from '@/model/summary';

export default function SummaryScreen() {
  const { colors, expenses, themeMode, t } = useApp();
  const { width } = useWindowDimensions();
  const isWeb = width >= 700;

  const [offset, setOffset] = useState(0);
  const fecha = mesConDesplazamiento(offset);
  const resumen = resumenDelMes(expenses, fecha);

  const renderTarjetaCategoria = (linea: (typeof resumen.porCategoria)[number]) => {
    const porcentaje = Math.round(linea.proporcion * 100);
    const colorCat = CATEGORIA_COLOR[linea.categoria] || colors.primary;

    return (
      <View
        key={linea.categoria}
        style={{
          flex: isWeb ? 1 : undefined,
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 16,
          gap: 12,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <CategoryMark category={linea.categoria} size={36} />
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginLeft: 12, flex: 1 }}>
            {t.categories[linea.categoria]}
          </Text>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>
            {formatoPesos(linea.total)}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: `${colorCat}20`, overflow: 'hidden' }}>
            <View
              style={{
                width: `${Math.max(porcentaje, linea.total > 0 ? 2 : 0)}%`,
                height: 6,
                backgroundColor: colorCat,
                borderRadius: 3,
              }}
            />
          </View>
          <Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600', width: 36, textAlign: 'right' }}>
            {porcentaje}%
          </Text>
        </View>
      </View>
    );
  };

  const filasCategorias: (typeof resumen.porCategoria)[] = [];
  if (isWeb) {
    for (let i = 0; i < resumen.porCategoria.length; i += 2) {
      filasCategorias.push(resumen.porCategoria.slice(i, i + 2));
    }
  }

  return (
    <Screen scroll tabInset>
      <View style={{ width: '100%', paddingHorizontal: isWeb ? 12 : 0, paddingBottom: isWeb ? 88 : 16 }}>
        {/* Selector de mes */}
        {isWeb ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
            <Pressable
              onPress={() => setOffset((valor) => valor - 1)}
              hitSlop={12}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: colors.card,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: '600', lineHeight: 26 }}>‹</Text>
            </Pressable>

            <Title>{resumen.titulo}</Title>

            <Pressable
              disabled={offset === 0}
              onPress={() => setOffset((valor) => Math.min(0, valor + 1))}
              hitSlop={12}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: offset === 0 ? 'transparent' : colors.card,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ color: offset === 0 ? 'transparent' : colors.text, fontSize: 24, fontWeight: '600', lineHeight: 26 }}>
                ›
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }}>
            <Pressable onPress={() => setOffset((valor) => valor - 1)} hitSlop={16}>
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: '600' }}>‹</Text>
            </Pressable>
            <Title>{resumen.titulo}</Title>
            <Pressable disabled={offset === 0} onPress={() => setOffset((valor) => Math.min(0, valor + 1))} hitSlop={16}>
              <Text style={{ color: offset === 0 ? 'transparent' : colors.text, fontSize: 28, fontWeight: '600' }}>›</Text>
            </Pressable>
          </View>
        )}

        {/* Métricas principales */}
        {resumen.total === 0 ? (
          <>
            <View style={{ backgroundColor: colors.primary, borderRadius: 28, padding: 22, marginTop: isWeb ? 0 : 14 }}>
              <Text
                style={{
                  color: themeMode === 'OSCURO' ? '#000000' : 'rgba(255,255,255,0.85)',
                  fontSize: 15,
                  fontWeight: '600',
                }}>
                {t.summaryMonthTotal}
              </Text>
              <Text
                style={{
                  color: themeMode === 'OSCURO' ? '#000000' : colors.onPrimary,
                  fontSize: 44,
                  fontWeight: '900',
                  marginTop: 4,
                }}>
                {formatoPesos(resumen.total)}
              </Text>
            </View>

            <View style={{ paddingTop: 64, alignItems: 'center' }}>
              <Text style={{ color: colors.muted, fontSize: 16 }}>{t.summaryEmptyMonth}</Text>
            </View>
          </>
        ) : (
          <>
            {isWeb ? (
              <View style={{ flexDirection: 'row', gap: 14, alignItems: 'stretch' }}>
                <View
                  style={{
                    flex: 1.4,
                    backgroundColor: colors.primary,
                    borderRadius: 24,
                    padding: 22,
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      color: themeMode === 'OSCURO' ? '#000000' : 'rgba(255,255,255,0.85)',
                      fontSize: 15,
                      fontWeight: '600',
                    }}>
                    {t.summaryMonthTotal}
                  </Text>
                  <Text
                    style={{
                      color: themeMode === 'OSCURO' ? '#000000' : colors.onPrimary,
                      fontSize: 40,
                      fontWeight: '900',
                      marginTop: 4,
                    }}>
                    {formatoPesos(resumen.total)}
                  </Text>
                </View>

                <Card style={{ flex: 1, backgroundColor: colors.card, borderRadius: 24, padding: 22, justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.muted, fontSize: 14, fontWeight: '600' }}>{t.summaryDailyAverage}</Text>
                  <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginTop: 8 }}>
                    {formatoPesos(resumen.promedioDiario)}
                  </Text>
                </Card>

                <Card style={{ flex: 1, backgroundColor: colors.card, borderRadius: 24, padding: 22, justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.muted, fontSize: 14, fontWeight: '600' }}>{t.summaryPreviousMonth}</Text>
                  <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginTop: 8 }}>
                    {formatoPesos(resumen.totalMesAnterior)}
                  </Text>
                </Card>
              </View>
            ) : (
              <>
                <View style={{ backgroundColor: colors.primary, borderRadius: 28, padding: 22, marginTop: 14 }}>
                  <Text
                    style={{
                      color: themeMode === 'OSCURO' ? '#000000' : 'rgba(255,255,255,0.85)',
                      fontSize: 15,
                      fontWeight: '600',
                    }}>
                    {t.summaryMonthTotal}
                  </Text>
                  <Text
                    style={{
                      color: themeMode === 'OSCURO' ? '#000000' : colors.onPrimary,
                      fontSize: 44,
                      fontWeight: '900',
                      marginTop: 4,
                    }}>
                    {formatoPesos(resumen.total)}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                  <Card style={{ flex: 1, backgroundColor: colors.card, borderRadius: 20, padding: 16 }}>
                    <Text style={{ color: colors.muted, fontSize: 13 }}>{t.summaryDailyAverage}</Text>
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 6 }}>
                      {formatoPesos(resumen.promedioDiario)}
                    </Text>
                  </Card>
                  <Card style={{ flex: 1, backgroundColor: colors.card, borderRadius: 20, padding: 16 }}>
                    <Text style={{ color: colors.muted, fontSize: 13 }}>{t.summaryPreviousMonth}</Text>
                    <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 6 }}>
                      {formatoPesos(resumen.totalMesAnterior)}
                    </Text>
                  </Card>
                </View>
              </>
            )}

            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 18, marginTop: 24, marginBottom: 12, marginLeft: 4 }}>
              {t.summaryByCategory}
            </Text>

            {isWeb ? (
              <View style={{ gap: 14 }}>
                {filasCategorias.map((fila, index) => (
                  <View key={index} style={{ flexDirection: 'row', gap: 14 }}>
                    {fila.map((linea) => renderTarjetaCategoria(linea))}
                    {fila.length === 1 ? <View style={{ flex: 1 }} /> : null}
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {resumen.porCategoria.map((linea) => renderTarjetaCategoria(linea))}
              </View>
            )}
          </>
        )}
      </View>
    </Screen>
  );
}