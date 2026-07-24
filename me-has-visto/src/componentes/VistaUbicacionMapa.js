import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colores } from "../estilos/colores";

function crearRegion(coordenadas) {
  return {
    latitude: coordenadas.latitude,
    longitude: coordenadas.longitude,
    latitudeDelta: 0.018,
    longitudeDelta: 0.018,
  };
}

export default function VistaUbicacionMapa({ coordenadas, textoVacio }) {
  const region = useMemo(() => {
    if (!coordenadas) {
      return null;
    }

    return crearRegion(coordenadas);
  }, [coordenadas]);

  if (!coordenadas || !region) {
    return (
      <View style={styles.vacioCaja}>
        <MaterialCommunityIcons name="map-marker-question-outline" size={28} color={colores.principalOscuro} />
        <Text style={styles.vacioTitulo}>Sin ubicación exacta</Text>
        <Text style={styles.vacioTexto}>
          {textoVacio || "Cuando selecciones un punto, aquí se mostrará una vista previa del mapa."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <MapView
        style={styles.mapa}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        region={region}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        pointerEvents="none"
      >
        <Marker coordinate={coordenadas} title="Ubicación seleccionada">
          <View style={styles.marcadorExterior}>
            <MaterialCommunityIcons name="map-marker" size={44} color={colores.principalOscuro} />
            <View style={styles.patitaInterna}>
              <MaterialCommunityIcons name="paw" size={16} color={colores.blanco} />
            </View>
          </View>
        </Marker>
      </MapView>

      <View style={styles.etiqueta}>
        <MaterialCommunityIcons name="check-circle" size={16} color={colores.principalOscuro} />
        <Text style={styles.etiquetaTexto}>Ubicación seleccionada</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colores.borde,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: colores.fondo,
  },
  mapa: {
    flex: 1,
  },
  marcadorExterior: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  patitaInterna: {
    position: "absolute",
    top: 9,
    left: 13,
    width: 19,
    height: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  etiqueta: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    backgroundColor: colores.blanco,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  etiquetaTexto: {
    color: colores.texto,
    fontSize: 12,
    fontWeight: "bold",
  },
  vacioCaja: {
    minHeight: 108,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.fondo,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  vacioTitulo: {
    color: colores.texto,
    fontWeight: "bold",
    fontSize: 13,
    marginTop: 5,
  },
  vacioTexto: {
    color: colores.gris,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
});
