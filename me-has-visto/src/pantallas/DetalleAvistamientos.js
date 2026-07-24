import React from "react";
import { ScrollView, View, Text, StyleSheet, Image, Share, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Boton from "../componentes/Boton";
import VistaUbicacionMapa from "../componentes/VistaUbicacionMapa";
import { colores } from "../estilos/colores";

function obtenerCoordenadas(item) {
  const latitude = Number(item?.latitud);
  const longitude = Number(item?.longitud);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

function crearLinkMaps(coordenadas) {
  return `https://www.google.com/maps/search/?api=1&query=${coordenadas.latitude},${coordenadas.longitude}`;
}

export default function DetalleAvistamientos({ route, navigation }) {
  const reporte = route.params?.reporte;
  const avistamientos = route.params?.avistamientos || reporte?.avistamientos || [];

  const verUbicacion = (avistamiento) => {
    const coordenadas = obtenerCoordenadas(avistamiento);

    if (!coordenadas) {
      return;
    }

    navigation.navigate("SeleccionarUbicacionMapa", {
      modoLectura: true,
      titulo: "Ubicación del avistamiento",
      ayuda: "Este es el punto marcado por la persona que envió el avistamiento.",
      latitudInicial: coordenadas.latitude,
      longitudInicial: coordenadas.longitude,
      nombreMascota: reporte?.nombreMascota,
    });
  };

  const abrirImagen = (uri) => {
    if (!uri) return;
    navigation.navigate("VistaImagen", { uri, titulo: "Imagen del avistamiento" });
  };

  const compartirUbicacion = async (avistamiento) => {
    const coordenadas = obtenerCoordenadas(avistamiento);

    if (!coordenadas) {
      return;
    }

    await Share.share({
      message: `Ubicación del avistamiento de ${reporte?.nombreMascota || "la mascota"}: ${crearLinkMaps(coordenadas)}`,
    });
  };

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cabecera}>
        <View style={styles.iconoCabecera}>
          <MaterialCommunityIcons name="eye-check-outline" size={28} color={colores.blanco} />
        </View>
        <View style={styles.infoCabecera}>
          <Text style={styles.titulo}>Avistamientos</Text>
          <Text style={styles.descripcion}>
            Información recibida sobre {reporte?.nombreMascota || "este reporte"}.
          </Text>
        </View>
      </View>

      {avistamientos.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.textoVacio}>Este reporte no tiene avistamientos registrados.</Text>
        </View>
      ) : (
        avistamientos.map((avistamiento, index) => {
          const coordenadas = obtenerCoordenadas(avistamiento);

          return (
            <View key={avistamiento.id || index} style={styles.tarjeta}>
              <View style={styles.filaSuperior}>
                <View style={styles.numeroCaja}>
                  <Text style={styles.numeroTexto}>{index + 1}</Text>
                </View>
                <View style={styles.infoSuperior}>
                  <Text style={styles.nombreUsuario}>
                    {avistamiento.usuarioNombre || "Usuario que reportó"}
                  </Text>
                  <Text style={styles.fecha}>{avistamiento.fecha || "Fecha no registrada"}</Text>
                </View>
              </View>

              {avistamiento.imagen ? (
                <TouchableOpacity activeOpacity={0.9} onPress={() => abrirImagen(avistamiento.imagen)}>
                  <Image source={{ uri: avistamiento.imagen }} style={styles.imagen} />
                  <View style={styles.etiquetaImagen}>
                    <MaterialCommunityIcons name="magnify-plus-outline" size={17} color={colores.blanco} />
                    <Text style={styles.textoEtiquetaImagen}>Ver imagen</Text>
                  </View>
                </TouchableOpacity>
              ) : null}

              <Text style={styles.label}>Observación</Text>
              <Text style={styles.texto}>{avistamiento.observacion || "Sin observación"}</Text>

              <Text style={styles.label}>Teléfono de contacto</Text>
              <Text style={styles.texto}>{avistamiento.telefono || "No registrado"}</Text>

              {coordenadas ? (
                <View style={styles.bloqueUbicacion}>
                  <VistaUbicacionMapa coordenadas={coordenadas} textoVacio="Ubicación del avistamiento" />

                  <View style={styles.filaBotones}>
                    <View style={styles.botonMitad}>
                      <Boton texto="Ver ubicación" tipo="secundario" onPress={() => verUbicacion(avistamiento)} />
                    </View>
                    <View style={styles.botonMitad}>
                      <Boton texto="Compartir" onPress={() => compartirUbicacion(avistamiento)} />
                    </View>
                  </View>
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: 14,
    paddingBottom: 120,
  },
  cabecera: {
    backgroundColor: colores.blanco,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: colores.borde,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconoCabecera: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colores.principalOscuro,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoCabecera: {
    flex: 1,
  },
  titulo: {
    color: colores.texto,
    fontWeight: "bold",
    fontSize: 22,
  },
  descripcion: {
    color: colores.gris,
    lineHeight: 19,
    marginTop: 3,
    fontSize: 13,
  },
  vacio: {
    backgroundColor: colores.blanco,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  textoVacio: {
    color: colores.gris,
    textAlign: "center",
  },
  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 14,
    marginBottom: 12,
  },
  filaSuperior: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  numeroCaja: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colores.principalOscuro,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  numeroTexto: {
    color: colores.blanco,
    fontWeight: "bold",
  },
  infoSuperior: {
    flex: 1,
  },
  nombreUsuario: {
    color: colores.texto,
    fontWeight: "bold",
    fontSize: 16,
  },
  fecha: {
    color: colores.gris,
    marginTop: 2,
    fontSize: 12,
  },
  imagen: {
    width: "100%",
    height: 180,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: colores.grisClaro,
  },
  etiquetaImagen: {
    position: "absolute",
    right: 10,
    bottom: 18,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  textoEtiquetaImagen: {
    color: colores.blanco,
    fontWeight: "bold",
    fontSize: 12,
  },
  label: {
    color: colores.texto,
    fontWeight: "bold",
    marginTop: 8,
  },
  texto: {
    color: colores.gris,
    lineHeight: 20,
    marginTop: 3,
  },
  bloqueUbicacion: {
    marginTop: 12,
  },
  filaBotones: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  botonMitad: {
    flex: 1,
  },
});
