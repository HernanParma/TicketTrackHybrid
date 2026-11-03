const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Metro no indexa .mjs. El render de servidor elige la condición "node" de
// Firebase, que apunta a dist/index.mjs, y por eso dice que el archivo no existe.
config.resolver.sourceExts.push('mjs');

const raiz = path.join(__dirname, 'node_modules');

// Builds de navegador. El de Node de Firestore usa gRPC y no sirve en la app.
const entradaServidor = {
  tslib: path.join(raiz, 'tslib', 'tslib.es6.mjs'),
  'firebase/app': path.join(raiz, 'firebase', 'app', 'dist', 'esm', 'index.esm.js'),
  'firebase/auth': path.join(raiz, 'firebase', 'auth', 'dist', 'esm', 'index.esm.js'),
  'firebase/firestore': path.join(raiz, 'firebase', 'firestore', 'dist', 'esm', 'index.esm.js'),
  '@firebase/app': path.join(raiz, '@firebase', 'app', 'dist', 'esm', 'index.esm.js'),
  '@firebase/auth': path.join(raiz, '@firebase', 'auth', 'dist', 'esm', 'index.js'),
  '@firebase/firestore': path.join(raiz, '@firebase', 'firestore', 'dist', 'index.esm.js'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const condiciones = context.unstable_conditionNames;
  const enServidor = Array.isArray(condiciones) && condiciones.includes('node');

  if (enServidor && entradaServidor[moduleName]) {
    return { type: 'sourceFile', filePath: entradaServidor[moduleName] };
  }

  const esFirebase =
    moduleName === 'firebase' ||
    moduleName.startsWith('firebase/') ||
    moduleName.startsWith('@firebase/');
  const siguiente = context.resolveRequest;

  if (enServidor && esFirebase && typeof siguiente === 'function') {
    return siguiente(
      {
        ...context,
        unstable_conditionNames: condiciones.filter((nombre) => nombre !== 'node'),
      },
      moduleName,
      platform,
    );
  }

  return siguiente(context, moduleName, platform);
};

module.exports = config;
