import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

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

type VentanaMapa = Window & { setPoint?: (lat: number, lng: number) => void };

export function EsriMap({
  latitude,
  longitude,
  markers = [],
  selectable = false,
  zoom = 13,
  onSelect,
  onMove,
}: Props) {
  const frame = useRef<HTMLIFrameElement | null>(null);
  const punto = useRef({ latitude, longitude });
  punto.current = { latitude, longitude };
  const [origen] = useState({ latitude, longitude });
  const serial = JSON.stringify(markers);
  const html = useMemo(() => {
    const puntos = JSON.parse(serial) as Marcador[];
    return htmlDelMapa(origen.latitude, origen.longitude, puntos, selectable, zoom);
  }, [serial, selectable, zoom, origen]);

  useEffect(() => {
    if (!selectable) return;
    const ventana = frame.current?.contentWindow as VentanaMapa | null;
    ventana?.setPoint?.(latitude, longitude);
  }, [latitude, longitude, selectable]);

  useEffect(() => {
    const recibir = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return;
      if (typeof event.data !== 'string') return;
      try {
        const data = JSON.parse(event.data) as {
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
    window.addEventListener('message', recibir);
    return () => window.removeEventListener('message', recibir);
  }, [onSelect, onMove]);

  return (
    <View style={styles.caja}>
      {createElement('iframe', {
        ref: frame,
        title: 'Mapa',
        srcDoc: html,
        onLoad: () => {
          if (!selectable) return;
          const ventana = frame.current?.contentWindow as VentanaMapa | null;
          ventana?.setPoint?.(punto.current.latitude, punto.current.longitude);
        },
        style: {
          border: '0',
          width: '100%',
          height: '100%',
          display: 'block',
          background: '#E7ECE8',
        },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { flex: 1, width: '100%', height: '100%', overflow: 'hidden' },
});
