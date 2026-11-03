export type Marcador = {
  id: string;
  latitude: number;
  longitude: number;
  color: string;
};

export function htmlDelMapa(
  latitude: number,
  longitude: number,
  markers: Marcador[],
  selectable: boolean,
  zoom: number,
) {
  const datos = JSON.stringify(markers).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { margin: 0; height: 100%; width: 100%; background: #E7ECE8; }
  .leaflet-control-attribution { font-size: 10px; max-width: 70%; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  function avisar(datos) {
    const json = JSON.stringify(datos);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(json);
    else window.parent.postMessage(json, '*');
  }
  const markers = ${datos};
  const selectable = ${selectable ? 'true' : 'false'};
  const map = L.map('map', { zoomControl: true, attributionControl: true }).setView([${latitude}, ${longitude}], ${zoom});
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© Esri, HERE, Garmin, OpenStreetMap',
    maxZoom: 19
  }).addTo(map);
  const capas = [];
  markers.forEach((item) => {
    const icon = L.divIcon({
      className: '',
      html: '<div style="width:18px;height:18px;border-radius:9px;background:' + item.color + ';border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    const marker = L.marker([item.latitude, item.longitude], { icon }).addTo(map);
    marker.on('click', () => avisar({ type: 'open', id: item.id }));
    capas.push(marker);
  });
  let punto = null;
  if (selectable) {
    punto = L.marker([${latitude}, ${longitude}], { draggable: true }).addTo(map);
    const emitir = (ll) => avisar({ type: 'move', lat: ll.lat, lng: ll.lng });
    punto.on('dragend', () => emitir(punto.getLatLng()));
    map.on('click', (event) => {
      punto.setLatLng(event.latlng);
      emitir(event.latlng);
    });
  } else if (capas.length > 1) {
    map.fitBounds(L.featureGroup(capas).getBounds().pad(0.4), { maxZoom: 15 });
  } else if (capas.length === 1) {
    map.setView(capas[0].getLatLng(), 14);
  }
  window.setPoint = (lat, lng) => {
    if (!punto) return;
    punto.setLatLng([lat, lng]);
    map.panTo([lat, lng]);
  };
  const ajustar = () => map.invalidateSize();
  window.setTimeout(ajustar, 150);
  window.addEventListener('resize', ajustar);
</script>
</body>
</html>`;
}
