import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIJO_UBICACION_TEMPORAL = "ubicacion_temporal_mhv_";

function obtenerClave(token) {
  return `${PREFIJO_UBICACION_TEMPORAL}${token}`;
}

export async function guardarUbicacionTemporal(token, ubicacion) {
  if (!token || !ubicacion) {
    return;
  }

  await AsyncStorage.setItem(
    obtenerClave(token),
    JSON.stringify({
      latitude: Number(ubicacion.latitude),
      longitude: Number(ubicacion.longitude),
      guardadoEn: new Date().toISOString(),
    })
  );
}

export async function leerYEliminarUbicacionTemporal(token) {
  if (!token) {
    return null;
  }

  const clave = obtenerClave(token);
  const datos = await AsyncStorage.getItem(clave);

  if (!datos) {
    return null;
  }

  await AsyncStorage.removeItem(clave);

  try {
    const ubicacion = JSON.parse(datos);

    if (
      typeof ubicacion?.latitude !== "number" ||
      typeof ubicacion?.longitude !== "number"
    ) {
      return null;
    }

    return ubicacion;
  } catch (error) {
    return null;
  }
}
