import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL = "http://192.168.100.8:8000/api";

const CLAVE_TOKEN_API = "me_has_visto_api_token";

export async function guardarTokenApi(token) {
  if (!token) {
    await AsyncStorage.removeItem(CLAVE_TOKEN_API);
    return;
  }

  await AsyncStorage.setItem(CLAVE_TOKEN_API, token);
}

export async function obtenerTokenApi() {
  return AsyncStorage.getItem(CLAVE_TOKEN_API);
}

export async function borrarTokenApi() {
  await AsyncStorage.removeItem(CLAVE_TOKEN_API);
}

function obtenerPrimerError(errores) {
  if (!errores || typeof errores !== "object") {
    return null;
  }

  const primeraClave = Object.keys(errores)[0];
  const primerValor = errores[primeraClave];

  if (Array.isArray(primerValor)) {
    return primerValor[0];
  }

  return primerValor || null;
}

export function obtenerMensajeErrorApi(error) {
  if (!error) {
    return "No se pudo completar la acción.";
  }

  return error.message || "No se pudo completar la acción.";
}

export async function peticionApi(ruta, opciones = {}) {
  const {
    method = "GET",
    body,
    auth = true,
    headers = {},
  } = opciones;

  const token = auth ? await obtenerTokenApi() : null;
  const url = `${API_BASE_URL}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;

  const respuesta = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const texto = await respuesta.text();
  let datos = null;

  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch (error) {
    datos = { message: texto };
  }

  if (!respuesta.ok) {
    const mensaje = obtenerPrimerError(datos?.errors) || datos?.message || `Error ${respuesta.status}`;
    const error = new Error(mensaje);
    error.status = respuesta.status;
    error.data = datos;
    throw error;
  }

  return datos;
}
