import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Boton from "../componentes/Boton";
import AlertaBonita from "../componentes/AlertaBonita";
import { colores } from "../estilos/colores";
import { guardarUbicacionTemporal } from "../servicios/almacenamientoUbicacionTemporal";

const REGION_MANTA = {
  latitude: -0.955533,
  longitude: -80.739627,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

function coordenadaInicial(route) {
  const latitud = Number(route?.params?.latitudInicial);
  const longitud = Number(route?.params?.longitudInicial);

  if (!Number.isNaN(latitud) && !Number.isNaN(longitud)) {
    return {
      latitude: latitud,
      longitude: longitud,
    };
  }

  return null;
}

function crearRegion(coordenada, zoom = 0.02) {
  return {
    latitude: coordenada.latitude,
    longitude: coordenada.longitude,
    latitudeDelta: zoom,
    longitudeDelta: zoom,
  };
}

function crearLinkMaps(coordenada) {
  return `https://www.google.com/maps/search/?api=1&query=${coordenada.latitude},${coordenada.longitude}`;
}

export default function SeleccionarUbicacionMapa({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const mapaRef = useRef(null);
  const ubicacionInicial = useMemo(() => coordenadaInicial(route), [route]);
  const [ubicacion, setUbicacion] = useState(ubicacionInicial);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);
  const [mapaListo, setMapaListo] = useState(false);
  const [ubicacionAutoIntentada, setUbicacionAutoIntentada] = useState(false);
  const [alerta, setAlerta] = useState(null);

  const token = route?.params?.token;
  const modoLectura = !!route?.params?.modoLectura;
  const nombreMascota = route?.params?.nombreMascota;
  const titulo = route?.params?.titulo || "Seleccionar ubicación";
  const ayuda =
    route?.params?.ayuda ||
    "Toca el mapa para marcar el lugar donde se perdió o fue vista la mascota.";

  const regionInicial = ubicacionInicial
    ? crearRegion(ubicacionInicial, 0.02)
    : REGION_MANTA;

  const cerrarAlerta = () => setAlerta(null);

  const moverMapa = useCallback((coordenada) => {
    const nuevaRegion = crearRegion(coordenada, 0.018);
    requestAnimationFrame(() => {
      mapaRef.current?.animateToRegion(nuevaRegion, 450);
    });
  }, []);

  const usarUbicacionActual = useCallback(
    async (silencioso = false) => {
      if (modoLectura) {
        return;
      }

      setCargandoUbicacion(true);

      try {
        const permiso = await Location.requestForegroundPermissionsAsync();

        if (!permiso.granted) {
          if (!silencioso) {
            setAlerta({
              tipo: "advertencia",
              titulo: "Permiso requerido",
              mensaje: "Debes permitir el acceso a la ubicación para usar tu posición actual.",
            });
          }
          return;
        }

        const posicion = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const coordenada = {
          latitude: posicion.coords.latitude,
          longitude: posicion.coords.longitude,
        };

        setUbicacion(coordenada);
        moverMapa(coordenada);
      } catch (error) {
        if (!silencioso) {
          setAlerta({
            tipo: "error",
            titulo: "No se pudo obtener",
            mensaje: "Intenta nuevamente o selecciona el punto manualmente en el mapa.",
          });
        }
      } finally {
        setCargandoUbicacion(false);
      }
    },
    [modoLectura, moverMapa]
  );

  useEffect(() => {
    if (!mapaListo) {
      return;
    }

    if (ubicacionInicial) {
      moverMapa(ubicacionInicial);
      return;
    }

    if (modoLectura || ubicacionAutoIntentada) {
      return;
    }

    setUbicacionAutoIntentada(true);
    usarUbicacionActual(true);
  }, [mapaListo, ubicacionInicial, ubicacionAutoIntentada, usarUbicacionActual, moverMapa, modoLectura]);

  const confirmarUbicacion = async () => {
    if (!ubicacion) {
      setAlerta({
        tipo: "advertencia",
        titulo: "Ubicación requerida",
        mensaje: "Toca el mapa para seleccionar un punto antes de continuar.",
      });
      return;
    }

    await guardarUbicacionTemporal(token, ubicacion);
    navigation.goBack();
  };

  const compartirUbicacion = async () => {
    if (!ubicacion) {
      return;
    }

    await Share.share({
      message: `Ubicación de ${nombreMascota || "la mascota"}: ${crearLinkMaps(ubicacion)}`,
    });
  };

  const cancelarSeleccion = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.pantalla}>
      <MapView
        ref={mapaRef}
        style={styles.mapa}
        provider={PROVIDER_GOOGLE}
        initialRegion={regionInicial}
        showsUserLocation={!modoLectura}
        showsMyLocationButton={false}
        loadingEnabled
        onMapReady={() => {
          setMapaListo(true);
          if (ubicacionInicial) {
            moverMapa(ubicacionInicial);
          }
        }}
        onPress={(evento) => {
          if (!modoLectura) {
            setUbicacion(evento.nativeEvent.coordinate);
          }
        }}
      >
        {ubicacion && (
          <Marker coordinate={ubicacion} title={modoLectura ? "Ubicación del avistamiento" : "Ubicación seleccionada"}>
            <View style={styles.marcadorMapa}>
              <MaterialCommunityIcons name="map-marker" size={54} color={colores.principalOscuro} />
              <View style={styles.patitaInterna}>
                <MaterialCommunityIcons name="paw" size={19} color={colores.blanco} />
              </View>
            </View>
          </Marker>
        )}
      </MapView>

      <View style={[styles.panel, { bottom: Math.max(insets.bottom + 24, 34) }]}>        
        <View style={styles.encabezadoPanel}>
          <View style={styles.iconoPanel}>
            <MaterialCommunityIcons name="map-marker-radius" size={22} color={colores.blanco} />
          </View>
          <View style={styles.textosPanel}>
            <Text style={styles.titulo}>{titulo}</Text>
            <Text style={styles.ayuda}>{ayuda}</Text>
          </View>
        </View>

        <View style={styles.coordenadasCaja}>
          <Text style={styles.coordenadasTexto}>
            {ubicacion
              ? modoLectura
                ? "Ubicación registrada en el mapa."
                : `Punto seleccionado: ${ubicacion.latitude.toFixed(6)}, ${ubicacion.longitude.toFixed(6)}`
              : "Aún no seleccionas un punto."}
          </Text>
        </View>

        {modoLectura ? (
          <View style={styles.filaBotones}>
            <TouchableOpacity
              style={styles.botonSecundario}
              onPress={compartirUbicacion}
              activeOpacity={0.85}
              disabled={!ubicacion}
            >
              <MaterialCommunityIcons name="share-variant" size={20} color={colores.principalOscuro} />
              <Text style={styles.botonSecundarioTexto}>Compartir</Text>
            </TouchableOpacity>

            <View style={styles.botonPrincipalContenedor}>
              <Boton texto="Volver" onPress={cancelarSeleccion} />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.filaBotones}>
              <TouchableOpacity
                style={styles.botonSecundario}
                onPress={() => usarUbicacionActual(false)}
                activeOpacity={0.85}
                disabled={cargandoUbicacion}
              >
                {cargandoUbicacion ? (
                  <ActivityIndicator color={colores.principalOscuro} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="crosshairs-gps" size={20} color={colores.principalOscuro} />
                    <Text style={styles.botonSecundarioTexto}>Mi ubicación</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.botonPrincipalContenedor}>
                <Boton texto="Confirmar" onPress={confirmarUbicacion} />
              </View>
            </View>

            <TouchableOpacity style={styles.botonCancelarPanel} onPress={cancelarSeleccion} activeOpacity={0.85}>
              <MaterialCommunityIcons name="close" size={18} color={colores.principalOscuro} />
              <Text style={styles.botonCancelarPanelTexto}>Cancelar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <AlertaBonita
        visible={!!alerta}
        tipo={alerta?.tipo}
        titulo={alerta?.titulo}
        mensaje={alerta?.mensaje}
        botones={alerta?.botones}
        onCerrar={cerrarAlerta}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  mapa: {
    flex: 1,
  },
  marcadorMapa: {
    width: 54,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  patitaInterna: {
    position: "absolute",
    top: 11,
    left: 17,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    position: "absolute",
    left: 12,
    right: 12,
    backgroundColor: colores.blanco,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
  },
  encabezadoPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconoPanel: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colores.principalOscuro,
    justifyContent: "center",
    alignItems: "center",
  },
  textosPanel: {
    flex: 1,
  },
  titulo: {
    color: colores.texto,
    fontWeight: "bold",
    fontSize: 16,
  },
  ayuda: {
    color: colores.gris,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  coordenadasCaja: {
    backgroundColor: colores.fondo,
    borderRadius: 14,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  coordenadasTexto: {
    color: colores.gris,
    fontSize: 12,
    fontWeight: "bold",
  },
  filaBotones: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  botonSecundario: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colores.naranjaClaro,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  botonSecundarioTexto: {
    color: colores.principalOscuro,
    fontWeight: "bold",
    fontSize: 13,
  },
  botonPrincipalContenedor: {
    flex: 1,
  },
  botonCancelarPanel: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: colores.fondo,
    borderWidth: 1,
    borderColor: colores.borde,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  botonCancelarPanelTexto: {
    color: colores.principalOscuro,
    fontWeight: "bold",
    fontSize: 14,
  },
});
