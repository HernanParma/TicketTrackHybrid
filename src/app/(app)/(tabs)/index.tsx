import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryMark } from '@/components/CategoryMark';
import { Muted, Title } from '@/components/ui';
import { useApp } from '@/context/AppProvider';
import { fechaCorta } from '@/model/dates';
import { CATEGORIAS, textoUbicacion, type Categoria, type Periodo } from '@/model/expense';
import { filtrarGastos } from '@/model/filters';
import { formatoPesos } from '@/model/money';

const PERIODOS: Periodo[] = ['TODOS', 'SEMANA', 'MES'];

export default function ExpensesScreen() {
  const { colors, t, expenses, expensesReady, online } = useApp();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const separacion = 12;
  const columnas = Math.max(2, Math.min(6, Math.floor((width - 32 + separacion) / 200)));
  const lado = (width - 32 - separacion * (columnas - 1)) / columnas;
  const [periodo, setPeriodo] = useState<Periodo>('TODOS');
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [abierto, setAbierto] = useState(false);
  const visibles = useMemo(
    () => filtrarGastos(expenses, categoria, periodo),
    [expenses, categoria, periodo],
  );
  const total = visibles.reduce((suma, gasto) => suma + gasto.amount, 0);
  const nombrePeriodo =
    periodo === 'TODOS' ? t.periodAll : periodo === 'SEMANA' ? t.periodWeek : t.periodMonth;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <FlatList
        key={columnas}
        data={visibles}
        keyExtractor={(item) => item.id}
        numColumns={columnas}
        columnWrapperStyle={{ gap: separacion }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120, gap: separacion }}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            <Title>{t.myExpenses}</Title>
            {!online ? (
              <View style={{ backgroundColor: '#F4E4B3', borderRadius: 16, padding: 12 }}>
                <Text style={{ color: '#5C4A12' }}>{t.offline}</Text>
              </View>
            ) : null}
            <View style={{ backgroundColor: colors.primary, borderRadius: 24, padding: 18, gap: 4 }}>
              <Text style={{ color: colors.onPrimary, fontSize: 32, fontWeight: '800' }}>{formatoPesos(total)}</Text>
              <Text style={{ color: colors.onPrimary }}>{t.expenseCount(visibles.length)}</Text>
              <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>{nombrePeriodo}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {PERIODOS.map((item) => {
                const activo = item === periodo;
                const etiqueta = item === 'TODOS' ? t.periodAll : item === 'SEMANA' ? t.periodWeek : t.periodMonth;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setPeriodo(item)}
                    style={{
                      backgroundColor: activo ? colors.primary : colors.card,
                      borderRadius: 999,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                    }}>
                    <Text style={{ color: activo ? colors.onPrimary : colors.text, fontWeight: '700' }}>{etiqueta}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              onPress={() => setAbierto((valor) => !valor)}
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}>
              {categoria ? <CategoryMark category={categoria} size={28} /> : null}
              <Text style={{ color: colors.text, flex: 1, fontWeight: '600' }}>
                {categoria ? t.categories[categoria] : t.categoryAll}
              </Text>
            </Pressable>
            {abierto ? (
              <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 8, gap: 4 }}>
                <Pressable onPress={() => { setCategoria(null); setAbierto(false); }} style={{ padding: 8 }}>
                  <Text style={{ color: colors.text }}>{t.categoryAll}</Text>
                </Pressable>
                {CATEGORIAS.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setCategoria(item);
                      setAbierto(false);
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 }}>
                    <CategoryMark category={item} size={28} />
                    <Text style={{ color: colors.text }}>{t.categories[item]}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          expensesReady ? (
            <Muted>{expenses.length === 0 ? t.emptyExpenses : t.emptyFilter}</Muted>
          ) : null
        }
        renderItem={({ item }) => {
          const lugar = textoUbicacion(item.placeLabel, item.latitude, item.longitude);
          const titulo = item.description.trim() || t.categories[item.category];
          return (
            <Pressable
              onPress={() => router.push(`/expense/${item.id}` as Href)}
              style={{
                width: lado,
                height: lado,
                backgroundColor: colors.card,
                borderRadius: 20,
                overflow: 'hidden',
              }}>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {item.photoUrl ? (
                  <Image source={{ uri: item.photoUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                ) : (
                  <CategoryMark category={item.category} size={Math.min(56, lado * 0.32)} />
                )}
              </View>
              <View style={{ paddingHorizontal: 10, paddingBottom: 10, gap: 2 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }} numberOfLines={1}>
                  {titulo}
                </Text>
                <Text style={{ color: colors.text, fontWeight: '800' }} numberOfLines={1}>
                  {formatoPesos(item.amount)}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
                  {fechaCorta(item.createdAt)}
                  {lugar ? ` · ${lugar}` : ''}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
      <Pressable
        onPress={() => router.push('/expense/new' as Href)}
        style={{
          position: 'absolute',
          right: 24,
          bottom: insets.bottom + 92,
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 6,
        }}>
        <Text style={{ color: colors.onPrimary, fontSize: 32, lineHeight: 34 }}>+</Text>
      </Pressable>
    </View>
  );
}
