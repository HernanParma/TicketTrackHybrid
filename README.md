# TicketTrack

App híbrida de gastos personales. Integrantes: Laura Arnés y Hernán Parma. Materia: Aplicaciones Móviles, UNAJ.

Cada usuario ve solo sus gastos. Se anotan con monto, categoría, nota, fecha, foto y lugar, y se consultan en la lista, el mapa, el resumen y el chat.

## Cómo correrla

```bash
npm install
npx expo start
```

Cámara, micrófono, ubicación precisa, mapa y el recordatorio usan módulos nativos. En Expo Go pueden faltar el dictado y las notificaciones locales. Para eso hace falta un development build:

```bash
npx expo run:android
```

El paquete Android es `com.example.tickettrack`.

## Claves

No van a git. Copiá `.env.example` a `.env` y completá los mismos valores que el proyecto Android:

- Firebase (`EXPO_PUBLIC_FIREBASE_*`)
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` y el client ID de Android
- `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`, `EXPO_PUBLIC_CLOUDINARY_API_KEY`, `EXPO_PUBLIC_CLOUDINARY_API_SECRET`
- `EXPO_PUBLIC_GEMINI_API_KEY`

El mapa no usa `MAPS_API_KEY`. Son teselas de Esri.

Para Google Sign-In en un build propio, el SHA-1 de ese keystore tiene que estar cargado en Firebase. El ingreso con email y contraseña no depende de eso.

## Firestore

Las reglas están en `firestore.rules`. El archivo no las activa: hay que publicarlas en la consola de Firebase. Solo el dueño lee, edita o borra su gasto, y al crear el `userId` tiene que ser el uid de la sesión.

## Notas de la entrega

La foto se firma y se sube a Cloudinary desde la app, igual que en Android. En una app publicada esa firma debería hacerla un backend.

La IA completa el formulario. No guarda el gasto sola.

El recordatorio diario no revisa si ese día ya hay gastos. El aviso dice «¿Cargaste tus gastos de hoy?» y abre la app.

Login, alta, detalle, resumen y chat quedan en español. La barra, los filtros, las categorías de la lista, el mapa y el perfil también están en inglés y portugués.
