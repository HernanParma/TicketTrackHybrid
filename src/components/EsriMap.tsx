import { useEffect, useMemo, useRef, useState, type ComponentType, type Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import WebView, { type WebViewMessageEvent, type WebViewProps } from 'react-native-webview';

import { htmlDelMapa, type Marcador } from '@/components/esriHtml';

type Props = {
  latitude: number;
  longitude: number;
  markers?: Marcador[];
  selectable?: boolean;
  zoom?: number;
  onSelect?: (id: string) => void;
  onMove?: (latitude: number, longitude: number) => void;
};

const Vista = WebView as ComponentType<
  WebViewProps & { ref?: Ref<{ injectJavaScript: (script: string) => void } | null> }
>;

export function EsriMap({
  latitude,
  longitude,
  markers = [],
  selectable = false,
  zoom = 13,
  onSelect,
  onMove,
}: Props) {
  const web = useRef<{ injectJavaScript: (script: string) => void } | null>(null);
  const [origen] = useState({ latitude, longitude });
  const serial = JSON.stringify(markers);
  const html = useMemo(() => {
    const puntos = JSON.parse(serial) as Marcador[];
    return htmlDelMapa(origen.latitude, origen.longitude, puntos, selectable, zoom);
  }, [serial, selectable, zoom, origen]);

  useEffect(() => {
    if (!selectable) return;
    web.current?.injectJavaScript(`window.setPoint && window.setPoint(${latitude}, ${longitude}); true;`);
  }, [latitude, longitude, selectable]);

  const alMensaje = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        id?: string;
        lat?: number;
        lng?: number;
      };
      if (data.type === 'open' && data.id) onSelect?.(data.id);
      if (data.type === 'move' && data.lat != null && data.lng != null) onMove?.(data.lat, data.lng);
    } catch {
      // Un mensaje que no es del mapa.
    }
  };

  return (
    <View style={styles.caja}>
      <Vista
        ref={web}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://unpkg.com' }}
        onMessage={alMensaje}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        setSupportMultipleWindows={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { flex: 1, overflow: 'hidden' },
});
