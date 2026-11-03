function requerida(nombre: string, valor: string | undefined): string {
  const limpio = valor?.trim() ?? '';
  if (!limpio) {
    throw new Error(`Falta ${nombre}. Copiá .env.example a .env con las claves del proyecto.`);
  }
  return limpio;
}

export const env = {
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  },
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
  cloudinary: {
    cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET ?? '',
  },
  geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '',
};

export function firebaseConfigListo(): boolean {
  return Boolean(env.firebase.apiKey && env.firebase.projectId && env.firebase.appId);
}

export function cloudinaryListo(): boolean {
  return Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);
}

export function exigirFirebase() {
  requerida('EXPO_PUBLIC_FIREBASE_API_KEY', env.firebase.apiKey);
  requerida('EXPO_PUBLIC_FIREBASE_PROJECT_ID', env.firebase.projectId);
  requerida('EXPO_PUBLIC_FIREBASE_APP_ID', env.firebase.appId);
}

export function exigirCloudinary() {
  requerida('EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME', env.cloudinary.cloudName);
  requerida('EXPO_PUBLIC_CLOUDINARY_API_KEY', env.cloudinary.apiKey);
  requerida('EXPO_PUBLIC_CLOUDINARY_API_SECRET', env.cloudinary.apiSecret);
}

export function exigirGemini() {
  return requerida('EXPO_PUBLIC_GEMINI_API_KEY', env.geminiApiKey);
}
