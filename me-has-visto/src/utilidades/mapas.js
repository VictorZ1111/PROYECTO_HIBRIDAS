import { Linking } from "react-native";

export function tieneCoordenadas(latitud, longitud) {
  return latitud !== null && latitud !== undefined && longitud !== null && longitud !== undefined;
}

export function crearUrlMapa(latitud, longitud) {
  return `https://www.google.com/maps/search/?api=1&query=${latitud},${longitud}`;
}

export async function abrirUbicacionEnMapa(latitud, longitud) {
  if (!tieneCoordenadas(latitud, longitud)) {
    return false;
  }

  const url = crearUrlMapa(latitud, longitud);
  await Linking.openURL(url);
  return true;
}
