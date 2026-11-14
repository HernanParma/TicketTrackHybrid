import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryMark } from '@/components/CategoryMark';
import { Title } from '@/components/ui';
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

  const isWeb = width >= 700;
  const numColumns = isWeb ? 2 : 1;

  const [periodo, setPeriodo] = useState<Periodo>('MES');
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [abierto, setAbierto] = useState(false);

  const visibles = useMemo(
    () => filtrarGastos(expenses, categoria, periodo),
    [expenses, categoria, periodo],
  );

  const total = visibles.reduce((suma, gasto) => suma + gasto.amount, 0);

  const nombrePeriodo =
    periodo === 'TODOS' ? t.periodAll : periodo === 'SEMANA' ? t.periodWeek : t.periodMonth;

  const renderCategorySelector = (compact = false) => (
    <View style={compact ? styles.webDropdownWrapper : undefined}>
      <Pressable
        onPress={() => setAbierto((valor) => !valor)}
        style={[
          styles.dropdownSelector,
          {
            backgroundColor: compact ? colors.background : colors.card,
            borderColor: colors.line,
            paddingVertical: compact ? 8 : 12,
          },
        ]}>
        <View style={styles.dropdownIconContainer}>
          {categoria ? (
            <CategoryMark category={categoria} size={26} />
          ) : (
            <Ionicons name="grid-outline" size={20} color={colors.primary} />
          )}
        </View>
        <View style={styles.dropdownTextContainer}>
          <Text style={[styles.dropdownLabel, { color: colors.muted }]}>{t.labelCategory}</Text>
          <Text style={[styles.dropdownValue, { color: colors.text }]}>
            {categoria ? t.categories[categoria] : t.categoryAll}
          </Text>
        </View>
        <Ionicons name={abierto ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
      </Pressable>

      {abierto ? (
        <View
          style={[
            styles.dropdownMenu,
            compact && styles.webDropdownMenuFloating,
            { backgroundColor: colors.card, borderColor: colors.line },
          ]}>
          <Pressable
            onPress={() => {
              setCategoria(null);
              setAbierto(false);
            }}
            style={styles.dropdownMenuItem}>
            <Ionicons name="grid-outline" size={22} color={colors.primary} />
            <Text style={[styles.dropdownMenuText, { color: colors.text }]}>{t.categoryAll}</Text>
          </Pressable>
          {CATEGORIAS.map((item) => (
            <Pressable
              key={item}
              onPress={() => {
                setCategoria(item);
                setAbierto(false);
              }}
              style={styles.dropdownMenuItem}>
              <CategoryMark category={item} size={28} />
              <Text style={[styles.dropdownMenuText, { color: colors.text }]}>{t.categories[item]}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <FlatList
        key={numColumns}
        data={visibles}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? { gap: 16, marginBottom: 12 } : undefined}
        contentContainerStyle={[
          styles.listContainer,
          isWeb && styles.webListContainer,
          { paddingBottom: insets.bottom + 110 },
        ]}
        ListHeaderComponentStyle={isWeb ? { zIndex: 30 } : undefined}
        ListHeaderComponent={
          isWeb ? (
            <View style={styles.webHeaderContainer}>
              <Title>{t.myExpenses}</Title>

              {!online ? (
                <View style={styles.offlineBox}>
                  <Text style={styles.offlineText}>{t.offline}</Text>
                </View>
              ) : null}

              <View style={styles.webDashboardRow}>
                <View style={[styles.mainCard, styles.webMainCard, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.mainCardPeriod, { color: colors.onPrimary }]}>{nombrePeriodo}</Text>
                  <Text style={[styles.mainCardTotal, styles.webMainCardTotal, { color: colors.onPrimary }]}>
                    {formatoPesos(total)}
                  </Text>
                </View>

                <View style={[styles.webFilterPanel, { backgroundColor: colors.card }]}>
                  <View style={[styles.webSegmentedTrack, { backgroundColor: colors.background }]}>
                    {PERIODOS.map((item) => {
                      const activo = item === periodo;
                      const etiqueta =
                        item === 'TODOS' ? t.periodAll : item === 'SEMANA' ? t.periodWeek : t.periodMonth;
                      return (
                        <Pressable
                          key={item}
                          onPress={() => setPeriodo(item)}
                          style={[
                            styles.webSegmentButton,
                            { backgroundColor: activo ? colors.primary : 'transparent' },
                          ]}>
                          <Text style={[styles.periodoTexto, { color: activo ? colors.onPrimary : colors.text }]}>
                            {etiqueta}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {renderCategorySelector(true)}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.headerContainer}>
              <Title>{t.myExpenses}</Title>

              {!online ? (
                <View style={styles.offlineBox}>
                  <Text style={styles.offlineText}>{t.offline}</Text>
                </View>
              ) : (
                <View />
              )}

              <View style={[styles.mainCard, { backgroundColor: colors.primary }]}>
                <Text style={[styles.mainCardPeriod, { color: colors.onPrimary }]}>{nombrePeriodo}</Text>
                <Text style={[styles.mainCardTotal, { color: colors.onPrimary }]}>{formatoPesos(total)}</Text>
              </View>

              <View style={styles.periodosRow}>
                {PERIODOS.map((item) => {
                  const activo = item === periodo;
                  const etiqueta =
                    item === 'TODOS' ? t.periodAll : item === 'SEMANA' ? t.periodWeek : t.periodMonth;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setPeriodo(item)}
                      style={[
                        styles.periodoBoton,
                        { backgroundColor: activo ? colors.primary : colors.card },
                      ]}>
                      <Text style={[styles.periodoTexto, { color: activo ? colors.onPrimary : colors.text }]}>
                        {etiqueta}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {renderCategorySelector(false)}
            </View>
          )
        }
        ListEmptyComponent={
          expensesReady ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                {expenses.length === 0 ? t.emptyExpenses : t.emptyFilter}
              </Text>
            </View>
          ) : (
            <View />
          )
        }
        renderItem={({ item }) => {
          const lugar = textoUbicacion(item.placeLabel, item.latitude, item.longitude);
          const titulo = item.description.trim() || t.categories[item.category];
          return (
            <Pressable
              onPress={() => router.push(`/expense/${item.id}` as Href)}
              style={[
                styles.expenseRow,
                {
                  backgroundColor: colors.card,
                  flex: 1,
                  maxWidth: isWeb ? '49.3%' : '100%',
                  marginBottom: numColumns > 1 ? 0 : 10,
                },
              ]}>
              <View style={styles.expenseIconContainer}>
                {item.photoUrl ? (
                  <Image source={{ uri: item.photoUrl }} style={styles.expenseImage} contentFit="cover" />
                ) : (
                  <CategoryMark category={item.category} size={28} />
                )}
              </View>
              <View style={styles.expenseInfo}>
                <Text style={[styles.expenseTitle, { color: colors.text }]} numberOfLines={1}>
                  {titulo}
                </Text>
                <Text style={[styles.expenseDetails, { color: colors.muted }]} numberOfLines={1}>
                  {t.categories[item.category]} · {fechaCorta(item.createdAt)}
                  {lugar ? ` · ${lugar}` : ''}
                </Text>
              </View>
              <Text style={[styles.expenseAmount, { color: colors.text }]}>
                {formatoPesos(item.amount)}
              </Text>
            </Pressable>
          );
        }}
      />

      <Pressable
        onPress={() => router.push('/expense/new' as Href)}
        style={[
          styles.fabButton,
          {
            backgroundColor: colors.primary,
            bottom: isWeb ? 21 : insets.bottom + 92,
            right: isWeb ? 28 : 24,
          },
        ]}>
        <Text style={[styles.fabText, { color: colors.onPrimary }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  listContainer: {
    padding: 16,
  },
  webListContainer: {
    paddingHorizontal: 28,
    paddingTop: 22,
  },
  headerContainer: {
    gap: 12,
    marginBottom: 16,
  },
  webHeaderContainer: {
    gap: 14,
    marginBottom: 18,
    zIndex: 30,
  },
  webDashboardRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
    zIndex: 30,
  },
  offlineBox: {
    backgroundColor: '#F4E4B3',
    borderRadius: 16,
    padding: 12,
  },
  offlineText: {
    color: '#5C4A12',
  },
  mainCard: {
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 20,
    gap: 4,
  },
  webMainCard: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 18,
  },
  mainCardPeriod: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  mainCardTotal: {
    fontSize: 34,
    fontWeight: 'bold',
  },
  webMainCardTotal: {
    fontSize: 40,
  },
  webFilterPanel: {
    flex: 1,
    borderRadius: 28,
    padding: 14,
    justifyContent: 'center',
    gap: 10,
    zIndex: 30,
  },
  webSegmentedTrack: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 4,
    gap: 4,
  },
  webSegmentButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodosRow: {
    flexDirection: 'row',
    gap: 8,
  },
  periodoBoton: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodoTexto: {
    fontWeight: '700',
    fontSize: 14,
  },
  webDropdownWrapper: {
    position: 'relative',
    zIndex: 40,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    gap: 12,
  },
  dropdownIconContainer: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownTextContainer: {
    flex: 1,
    gap: 1,
  },
  dropdownLabel: {
    fontSize: 11,
  },
  dropdownValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  dropdownMenu: {
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    gap: 4,
  },
  webDropdownMenuFloating: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 6,
    zIndex: 50,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 12,
  },
  dropdownMenuText: {
    fontSize: 15,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  expenseIconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseImage: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  expenseInfo: {
    flex: 1,
    gap: 2,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  expenseDetails: {
    fontSize: 13,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fabButton: {
    position: 'absolute',
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  fabText: {
    fontSize: 32,
    lineHeight: 34,
  },
});
