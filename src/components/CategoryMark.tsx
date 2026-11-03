import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';

import { CATEGORIA_COLOR, CATEGORIA_ICONO, type Categoria } from '@/model/expense';

export function CategoryMark({
  category,
  size = 44,
}: {
  category: Categoria;
  size?: number;
}) {
  const color = CATEGORIA_COLOR[category];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 3,
        backgroundColor: `${color}22`,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <MaterialIcons name={CATEGORIA_ICONO[category]} size={size * 0.5} color={color} />
    </View>
  );
}
