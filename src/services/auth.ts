import {
  browserPopupRedirectResolver,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";

import { authFirebase } from "@/services/firebase";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let tokenGoogle: string | null = null;

export function recordarTokenGoogle(token: string | null) {
  tokenGoogle = token;
}

export function observarSesion(callback: (usuario: User | null) => void) {
  return onAuthStateChanged(authFirebase(), callback);
}

export function validarIngreso(email: string, password: string): string | null {
  if (!email.trim() || !password) {
    return "Completá el email y la contraseña.";
  }

  if (!EMAIL.test(email.trim())) {
    return "El email no es válido.";
  }

  if (password.length < 6) {
    return "La contraseña tiene que tener al menos 6 caracteres.";
  }

  return null;
}

export function validarRegistro(
  email: string,
  password: string,
  repetir: string,
): string | null {
  if (!email.trim() || !password || !repetir) {
    return "Completá el email y las dos contraseñas.";
  }

  if (!EMAIL.test(email.trim())) {
    return "El email no es válido.";
  }

  if (password.length < 6) {
    return "La contraseña tiene que tener al menos 6 caracteres.";
  }

  if (password !== repetir) {
    return "Las contraseñas no coinciden.";
  }

  return null;
}

export async function ingresar(email: string, password: string) {
  const error = validarIngreso(email, password);

  if (error) throw new Error(error);

  try {
    await signInWithEmailAndPassword(authFirebase(), email.trim(), password);
  } catch (causa) {
    throw new Error(mensajeAuth(causa));
  }
}

export async function registrar(
  email: string,
  password: string,
  repetir: string,
) {
  const error = validarRegistro(email, password, repetir);

  if (error) throw new Error(error);

  try {
    await createUserWithEmailAndPassword(
      authFirebase(),
      email.trim(),
      password,
    );
  } catch (causa) {
    throw new Error(mensajeAuth(causa));
  }
}

// Se conserva para compatibilidad con posibles llamadas anteriores.
export function prepararIngresoGoogle() {
  // Ya no hace falta cargar Firebase dinámicamente.
}

export async function ingresarConVentanaGoogle() {
  const proveedor = new GoogleAuthProvider();

  proveedor.setCustomParameters({
    prompt: "select_account",
  });

  try {
    await signInWithPopup(
      authFirebase(),
      proveedor,
      browserPopupRedirectResolver,
    );
  } catch (causa) {
    const codigo = codigoAuth(causa);

    if (
      codigo === "auth/popup-closed-by-user" ||
      codigo === "auth/cancelled-popup-request"
    ) {
      return;
    }

    throw new Error(mensajeAuth(causa));
  }
}

export async function ingresarConGoogle(
  idToken: string,
  accessToken?: string | null,
) {
  if (!idToken && !accessToken) {
    throw new Error("Google no devolvió credenciales válidas.");
  }

  recordarTokenGoogle(accessToken ?? null);

  try {
    const credencial = GoogleAuthProvider.credential(
      idToken || null,
      accessToken || null,
    );

    await signInWithCredential(authFirebase(), credencial);
  } catch (causa) {
    throw new Error(mensajeAuth(causa));
  }
}

export async function cerrarSesion() {
  const token = tokenGoogle;
  tokenGoogle = null;

  await signOut(authFirebase());

  if (!token) return;

  try {
    await fetch(
      `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
  } catch {
    // Firebase ya cerró la sesión.
  }
}

function codigoAuth(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    return String(error.code);
  }

  return "";
}

function mensajeAuth(error: unknown): string {
  switch (codigoAuth(error)) {
    case "auth/email-already-in-use":
      return "Ese email ya está registrado. Ingresá con tu contraseña o con Google.";

    case "auth/invalid-email":
      return "El email no es válido.";

    case "auth/weak-password":
      return "La contraseña tiene que tener al menos 6 caracteres.";

    case "auth/wrong-password":
      return "La contraseña es incorrecta.";

    case "auth/user-not-found":
      return "No hay una cuenta con ese email. Creá una cuenta nueva.";

    case "auth/user-disabled":
      return "Esa cuenta está deshabilitada.";

    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "El email o la contraseña no coinciden.";

    case "auth/account-exists-with-different-credential":
      return "Ese email ya está registrado con otro método. Probá con email y contraseña.";

    case "auth/too-many-requests":
      return "Demasiados intentos. Esperá un momento y volvé a probar.";

    case "auth/popup-blocked":
      return "El navegador bloqueó la ventana de Google. Permití las ventanas emergentes.";

    case "auth/unauthorized-domain":
      return "Este dominio no está autorizado en Firebase Authentication.";

    case "auth/argument-error":
    case "auth/operation-not-supported-in-this-environment":
      return "El navegador no pudo abrir el ingreso de Google. Recargá la página.";

    case "auth/network-request-failed":
      return "No hay conexión. Revisá internet.";

    case "auth/operation-not-allowed":
      return "Ese método de ingreso no está habilitado en Firebase.";

    default:
      return "No se pudo completar el ingreso. Probá de nuevo.";
  }
}
