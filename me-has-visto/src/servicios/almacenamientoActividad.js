import AsyncStorage from "@react-native-async-storage/async-storage";

const CLAVE_ACTIVIDAD = "actividad_contactos_reportes_v1";

export async function obtenerActividadLocal() {
  try {
    const datos = await AsyncStorage.getItem(CLAVE_ACTIVIDAD);
    return datos ? JSON.parse(datos) : [];
  } catch (error) {
    console.log("Error al obtener actividad local:", error);
    return [];
  }
}

export async function guardarActividadLocal(actividad) {
  try {
    await AsyncStorage.setItem(CLAVE_ACTIVIDAD, JSON.stringify(actividad));
  } catch (error) {
    console.log("Error al guardar actividad local:", error);
  }
}
