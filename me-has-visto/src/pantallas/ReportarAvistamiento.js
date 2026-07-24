import React, { useCallback, useState } from "react";
import {
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CampoTexto from "../componentes/CampoTexto";
import Boton from "../componentes/Boton";
import VistaUbicacionMapa from "../componentes/VistaUbicacionMapa";
import AlertaBonita from "../componentes/AlertaBonita";
import { colores } from "../estilos/colores";
import { leerYEliminarUbicacionTemporal } from "../servicios/almacenamientoUbicacionTemporal";

function obtenerCoordenadasValidas(latitudValor, longitudValor) {
  if (latitudValor === null || longitudValor === null || latitudValor === "" || longitudValor === "") {
    return null;
  }

  const latitud = Number(latitudValor);
  const longitud = Number(longitudValor);

  if (
    Number.isNaN(latitud) ||
    Number.isNaN(longitud) ||
    latitud < -5.2 ||
    latitud > 1.8 ||
    longitud < -92.5 ||
    longitud > -75
  ) {
    return false;
  }

  return { latitude: latitud, longitude: longitud };
}

export default function ReportarAvistamiento({
  route,
  navigation,
  usuario,
  registrarAvistamiento,
}) {
  const { reporte } = route.params;
  const insets = useSafeAreaInsets();
  const esAdmin = usuario?.rol === "admin";
  const esPropio =
    reporte?.usuarioId && usuario?.id
      ? String(reporte.usuarioId) === String(usuario.id)
      : reporte?.propio;
  const disponible = (reporte?.estadoReporte || "activo") === "activo" && reporte?.estado !== "Encontrada";
  const puedeReportar = !esAdmin && !esPropio && disponible;

  const [observacion, setObservacion] = useState("");
  const [imagen, setImagen] = useState(null);
  const [latitudSeleccionada, setLatitudSeleccionada] = useState(null);
  const [longitudSeleccionada, setLongitudSeleccionada] = useState(null);
  const [tokenSeleccionMapa, setTokenSeleccionMapa] = useState(null);
  const [alerta, setAlerta] = useState(null);
  const telefonoContacto = usuario?.telefono || "";

  const coordenadasActuales = obtenerCoordenadasValidas(latitudSeleccionada, longitudSeleccionada);

  const cerrarAlerta = () => setAlerta(null);

  const mostrarAlerta = (titulo, mensaje, tipo = "info", botones = []) => {
    setAlerta({ titulo, mensaje, tipo, botones });
  };
  const ubicacionLista = coordenadasActuales && coordenadasActuales !== false;

  useFocusEffect(
    useCallback(() => {
      let activo = true;

      async function cargarUbicacionSeleccionada() {
        if (!tokenSeleccionMapa) {
          return;
        }

        const ubicacion = await leerYEliminarUbicacionTemporal(tokenSeleccionMapa);

        if (activo && ubicacion) {
          setLatitudSeleccionada(ubicacion.latitude);
          setLongitudSeleccionada(ubicacion.longitude);
          setTokenSeleccionMapa(null);
        }
      }

      cargarUbicacionSeleccionada();

      return () => {
        activo = false;
      };
    }, [tokenSeleccionMapa])
  );

  const seleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      mostrarAlerta("Permiso requerido", "Debes permitir acceso a la galería.", "advertencia");
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!resultado.canceled) {
      setImagen(resultado.assets[0].uri);
    }
  };


  const tomarFoto = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();

    if (!permiso.granted) {
      mostrarAlerta("Permiso requerido", "Debes permitir acceso a la cámara para tomar una foto.", "advertencia");
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!resultado.canceled) {
      setImagen(resultado.assets[0].uri);
    }
  };

  const abrirMapaUbicacion = () => {
    const token = `avistamiento-${Date.now()}`;
    setTokenSeleccionMapa(token);

    navigation.navigate("SeleccionarUbicacionMapa", {
      token,
      titulo: "Ubicación del avistamiento",
      ayuda: "Toca el mapa para marcar el lugar donde viste a la mascota. También puedes usar tu ubicación actual desde el mapa.",
      latitudInicial: latitudSeleccionada,
      longitudInicial: longitudSeleccionada,
    });
  };

  const confirmarSeleccionMapa = () => {
    abrirMapaUbicacion();
  };

  const quitarUbicacion = () => {
    setLatitudSeleccionada(null);
    setLongitudSeleccionada(null);
  };

  const abrirImagenSeleccionada = () => {
    if (!imagen) return;
    navigation.navigate("VistaImagen", {
      uri: imagen,
      titulo: "Imagen del avistamiento",
    });
  };

  const enviarAvistamiento = async () => {
    if (!puedeReportar) {
      mostrarAlerta(
        "Avistamiento no disponible",
        "No puedes reportar avistamientos sobre tus propios reportes, reportes encontrados o desde una cuenta administrativa.",
        "advertencia"
      );
      return;
    }

    if (!observacion.trim()) {
      mostrarAlerta("Observación requerida", "Escribe dónde o cómo viste a la mascota.", "advertencia");
      return;
    }

    if (observacion.trim().length < 10) {
      mostrarAlerta("Observación muy corta", "Agrega un poco más de información sobre el avistamiento.", "advertencia");
      return;
    }

    if (!telefonoContacto.trim()) {
      mostrarAlerta(
        "Teléfono requerido",
        "Agrega tu número en el perfil antes de enviar un avistamiento.",
        "advertencia"
      );
      return;
    }

    const coordenadas = obtenerCoordenadasValidas(latitudSeleccionada, longitudSeleccionada);

    if (coordenadas === false) {
      mostrarAlerta(
        "Ubicación inválida",
        "Selecciona un punto válido dentro de Ecuador.",
        "advertencia"
      );
      return;
    }

    const avistamiento = {
      id: Date.now(),
      usuarioId: usuario?.id || null,
      observacion: observacion.trim(),
      telefonoContacto: telefonoContacto.trim(),
      imagen,
      latitud: coordenadas?.latitude || null,
      longitud: coordenadas?.longitude || null,
      fecha: new Date().toLocaleDateString("es-EC"),
      creadoEn: new Date().toISOString(),
      sincronizado: false,
      pendienteSincronizacion: true,
      usuarioNombre: usuario?.nombreCompleto || "Usuario",
      usuarioFoto: usuario?.fotoPerfil || null,
      reporteNombreMascota: reporte.nombreMascota,
    };

    if (reporte?.id) {
      await registrarAvistamiento(reporte.id, avistamiento);
    }

    mostrarAlerta(
      "Avistamiento enviado",
      `Tu avistamiento sobre ${reporte.nombreMascota} fue guardado.`,
      "exito",
      [{ texto: "Continuar", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        style={styles.contenedor}
        contentContainerStyle={[
          styles.contenido,
          { paddingBottom: Math.max(insets.bottom + 220, 240) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.descripcion}>
          Informa si viste a {reporte.nombreMascota}. Puedes agregar imagen, observación y ubicación.
        </Text>

        {!puedeReportar && (
          <View style={styles.avisoBloqueo}>
            <Text style={styles.avisoTitulo}>Avistamiento bloqueado</Text>
            <Text style={styles.avisoTexto}>
              Esta acción solo se permite en reportes ajenos, activos y pendientes de encontrar.
            </Text>
          </View>
        )}

        <View style={styles.fotoCaja}>
          {imagen ? (
            <TouchableOpacity activeOpacity={0.85} onPress={abrirImagenSeleccionada}>
              <Image source={{ uri: imagen }} style={styles.imagen} />
            </TouchableOpacity>
          ) : (
            <Text style={styles.fotoTexto}>Sin imagen seleccionada</Text>
          )}

          <View style={styles.filaFotoBotones}>
            <View style={styles.botonFotoMitad}>
              <Boton texto={imagen ? "Cambiar" : "Seleccionar"} tipo="secundario" onPress={seleccionarImagen} deshabilitado={!puedeReportar} />
            </View>
            <View style={styles.botonFotoMitad}>
              <Boton texto="Tomar foto" onPress={tomarFoto} deshabilitado={!puedeReportar} />
            </View>
          </View>
        </View>

        <CampoTexto
          placeholder="Observaciones del avistamiento"
          value={observacion}
          onChangeText={setObservacion}
          multiline
        />

        <View style={styles.caja}>
          <Text style={styles.seccion}>Lugar del avistamiento</Text>
          <Text style={styles.textoAyuda}>
            La ubicación exacta es opcional. Selecciona en el mapa el punto donde viste a la mascota.
          </Text>

          <VistaUbicacionMapa
            coordenadas={ubicacionLista ? coordenadasActuales : null}
            textoVacio="Cuando marques el punto del avistamiento, aquí se mostrará la vista previa del mapa."
          />

          <View style={styles.filaUbicacionBotones}>
            <View style={styles.botonUbicacionMitad}>
              <Boton
                texto={ubicacionLista ? "Cambiar" : "Agregar ubicación"}
                tipo="secundario"
                onPress={confirmarSeleccionMapa}
                deshabilitado={!puedeReportar}
              />
            </View>

            {ubicacionLista && (
              <View style={styles.botonUbicacionMitad}>
                <Boton texto="Quitar" tipo="rojo" onPress={quitarUbicacion} deshabilitado={!puedeReportar} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.caja}>
          <Text style={styles.seccion}>Datos de contacto</Text>
          <Text style={styles.label}>Reportado por</Text>
          <Text style={styles.texto}>{usuario?.nombreCompleto || "Usuario"}</Text>

          <Text style={styles.label}>Teléfono</Text>
          <Text style={styles.texto}>{telefonoContacto || "No registrado en perfil"}</Text>
        </View>

        <Boton texto="Enviar avistamiento" onPress={enviarAvistamiento} />
      </ScrollView>

      <AlertaBonita
        visible={!!alerta}
        tipo={alerta?.tipo}
        titulo={alerta?.titulo}
        mensaje={alerta?.mensaje}
        botones={alerta?.botones}
        onCerrar={cerrarAlerta}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: 14,
  },
  descripcion: {
    color: colores.gris,
    marginBottom: 12,
    lineHeight: 20,
    fontSize: 14,
  },
  avisoBloqueo: {
    backgroundColor: colores.naranjaClaro,
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
  },
  avisoTitulo: {
    color: colores.principalOscuro,
    fontWeight: "bold",
    marginBottom: 3,
  },
  avisoTexto: {
    color: colores.texto,
    lineHeight: 19,
  },
  fotoCaja: {
    backgroundColor: colores.blanco,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 10,
  },
  imagen: {
    width: "100%",
    height: 190,
    borderRadius: 16,
    marginBottom: 8,
  },
  fotoTexto: {
    height: 120,
    textAlign: "center",
    textAlignVertical: "center",
    color: colores.gris,
    marginBottom: 8,
    backgroundColor: colores.grisClaro,
    borderRadius: 14,
  },
  filaFotoBotones: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  botonFotoMitad: {
    flex: 1,
  },
  caja: {
    backgroundColor: colores.blanco,
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colores.borde,
    marginVertical: 10,
  },
  seccion: {
    color: colores.texto,
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 6,
  },
  textoAyuda: {
    color: colores.gris,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  filaUbicacionBotones: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  botonUbicacionMitad: {
    flex: 1,
  },
  label: {
    fontWeight: "bold",
    color: colores.texto,
    marginTop: 4,
  },
  texto: {
    color: colores.gris,
    marginTop: 3,
  },
});
