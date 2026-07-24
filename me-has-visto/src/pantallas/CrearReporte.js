import React, { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CampoTexto from "../componentes/CampoTexto";
import Boton from "../componentes/Boton";
import SelectorDesplegable from "../componentes/SelectorDesplegable";
import VistaUbicacionMapa from "../componentes/VistaUbicacionMapa";
import AlertaBonita from "../componentes/AlertaBonita";
import { colores } from "../estilos/colores";
import {
  PROVINCIAS_ECUADOR,
  obtenerCiudadesPorProvincia,
} from "../utilidades/ubicacionesEcuador";
import { leerYEliminarUbicacionTemporal } from "../servicios/almacenamientoUbicacionTemporal";
import { crearReporteApi } from "../servicios/almacenamientoReportes";

function obtenerFechaVisible() {
  const fecha = new Date();
  return fecha.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

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

export default function CrearReporte({
  navigation,
  reportes,
  actualizarReportes,
  usuario,
}) {
  const insets = useSafeAreaInsets();

  const [nombreMascota, setNombreMascota] = useState("");
  const [tipoMascota, setTipoMascota] = useState("");
  const [raza, setRaza] = useState("");
  const [color, setColor] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [provincia, setProvincia] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [sector, setSector] = useState("");
  const [imagen, setImagen] = useState(null);
  const [latitudSeleccionada, setLatitudSeleccionada] = useState(null);
  const [longitudSeleccionada, setLongitudSeleccionada] = useState(null);
  const [tokenSeleccionMapa, setTokenSeleccionMapa] = useState(null);
  const [alerta, setAlerta] = useState(null);

  const telefonoUsuario = usuario?.telefono || "";

  const ciudades = useMemo(() => obtenerCiudadesPorProvincia(provincia), [provincia]);

  const cerrarAlerta = () => setAlerta(null);

  const mostrarAlerta = (titulo, mensaje, tipo = "info", botones = []) => {
    setAlerta({ titulo, mensaje, tipo, botones });
  };

  const coordenadasActuales = obtenerCoordenadasValidas(latitudSeleccionada, longitudSeleccionada);
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
      mostrarAlerta("Permiso requerido", "Debes permitir el acceso a la galería.", "advertencia");
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
    const token = `crear-reporte-${Date.now()}`;
    setTokenSeleccionMapa(token);

    navigation.navigate("SeleccionarUbicacionMapa", {
      token,
      titulo: "Ubicación del reporte",
      ayuda: "Toca el mapa para marcar el lugar donde se perdió o fue vista la mascota. También puedes usar tu ubicación actual desde el mapa.",
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
      titulo: "Imagen del reporte",
    });
  };

  const guardarReporte = async () => {
    if (usuario?.rol === "admin") {
      mostrarAlerta("Acción no disponible", "El administrador no crea reportes de mascotas.", "advertencia");
      return;
    }

    if (!telefonoUsuario.trim()) {
      mostrarAlerta(
        "Teléfono requerido",
        "Agrega tu número en el perfil antes de crear un reporte. Ese número se usará automáticamente como contacto.",
        "advertencia"
      );
      return;
    }

    if (
      !nombreMascota.trim() ||
      !tipoMascota.trim() ||
      !color.trim() ||
      !descripcion.trim() ||
      !provincia.trim() ||
      !ciudad.trim() ||
      !sector.trim()
    ) {
      mostrarAlerta("Campos incompletos", "Completa los datos principales del reporte.", "advertencia");
      return;
    }

    if (descripcion.trim().length < 15) {
      mostrarAlerta(
        "Descripción muy corta",
        "Agrega más detalles para identificar mejor a la mascota.",
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

    const fechaIso = new Date().toISOString();

    const nuevoReporte = {
      id: Date.now(),
      usuarioId: usuario?.id || null,
      nombreMascota: nombreMascota.trim(),
      tipoMascota: tipoMascota.trim(),
      raza: raza.trim() || "No especificada",
      color: color.trim(),
      descripcion: descripcion.trim(),
      estado: "Perdida",
      estadoReporte: "activo",
      provincia: provincia.trim(),
      ciudad: ciudad.trim(),
      sector: sector.trim(),
      telefono: telefonoUsuario.trim(),
      fecha: obtenerFechaVisible(),
      creadoEn: fechaIso,
      actualizadoEn: fechaIso,
      imagen:
        imagen ||
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=900",
      latitud: coordenadas?.latitude || null,
      longitud: coordenadas?.longitude || null,
      sincronizado: false,
      pendienteSincronizacion: true,
      propio: true,
      actividad: false,
      tipoActividad: null,
      avistamientos: [],
      usuarioNombre: usuario?.nombreCompleto || "Usuario",
      usuarioFoto: usuario?.fotoPerfil || null,
    };

    try {
      const reporteGuardado = await crearReporteApi(nuevoReporte);
      const nuevosReportes = [
        reporteGuardado,
        ...reportes.filter((reporte) => String(reporte.id) !== String(reporteGuardado.id)),
      ];
      await actualizarReportes(nuevosReportes);

      mostrarAlerta("Reporte guardado", "Tu reporte fue guardado correctamente.", "exito", [
        { texto: "Continuar", onPress: () => navigation.navigate("AppPrincipal") },
      ]);
    } catch (error) {
      mostrarAlerta(
        "No se pudo guardar",
        error.message || "Revisa tu conexión e inténtalo nuevamente.",
        "error"
      );
    }
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
          { paddingBottom: Math.max(insets.bottom + 230, 250) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.fotoCaja}>
          {imagen ? (
            <TouchableOpacity activeOpacity={0.85} onPress={abrirImagenSeleccionada}>
              <Image source={{ uri: imagen }} style={styles.imagen} />
            </TouchableOpacity>
          ) : (
            <Text style={styles.fotoTexto}>Sin foto seleccionada</Text>
          )}

          <View style={styles.filaFotoBotones}>
            <View style={styles.botonFotoMitad}>
              <Boton texto="Seleccionar" tipo="secundario" onPress={seleccionarImagen} />
            </View>
            <View style={styles.botonFotoMitad}>
              <Boton texto="Tomar foto" onPress={tomarFoto} />
            </View>
          </View>
        </View>

        <View style={styles.caja}>
          <Text style={styles.seccion}>Datos de la mascota</Text>

          <CampoTexto
            placeholder="Nombre de la mascota"
            value={nombreMascota}
            onChangeText={setNombreMascota}
          />

          <View style={styles.fila}>
            <View style={styles.mitad}>
              <CampoTexto placeholder="Mascota" value={tipoMascota} onChangeText={setTipoMascota} />
            </View>

            <View style={styles.mitad}>
              <CampoTexto placeholder="Color" value={color} onChangeText={setColor} />
            </View>
          </View>

          <CampoTexto placeholder="Raza" value={raza} onChangeText={setRaza} />

          <CampoTexto
            placeholder="Descripción"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
          />
        </View>

        <View style={styles.caja}>
          <Text style={styles.seccion}>Lugar del reporte</Text>

          <SelectorDesplegable
            etiqueta="Provincia"
            valor={provincia}
            placeholder="Selecciona una provincia"
            opciones={PROVINCIAS_ECUADOR}
            onChange={(valor) => {
              setProvincia(valor);
              setCiudad("");
            }}
          />

          <SelectorDesplegable
            etiqueta="Ciudad"
            valor={ciudad}
            placeholder="Selecciona una ciudad"
            opciones={ciudades}
            onChange={setCiudad}
            deshabilitado={!provincia}
          />

          <CampoTexto placeholder="Sector o referencia" value={sector} onChangeText={setSector} />

          <Text style={styles.textoAyuda}>
            La ubicación exacta es opcional. Selecciona el punto en el mapa si quieres indicar dónde se perdió o fue vista la mascota.
          </Text>

          <VistaUbicacionMapa
            coordenadas={ubicacionLista ? coordenadasActuales : null}
            textoVacio="Puedes marcar en el mapa el punto donde se perdió o fue vista la mascota."
          />

          <View style={styles.filaUbicacionBotones}>
            <View style={styles.botonUbicacionMitad}>
              <Boton
                texto={ubicacionLista ? "Cambiar" : "Agregar ubicación"}
                tipo="secundario"
                onPress={confirmarSeleccionMapa}
              />
            </View>

            {ubicacionLista && (
              <View style={styles.botonUbicacionMitad}>
                <Boton texto="Quitar" tipo="rojo" onPress={quitarUbicacion} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.cajaContacto}>
          <Text style={styles.seccion}>Datos de contacto</Text>
          <Text style={styles.label}>Teléfono de contacto</Text>
          <View style={styles.telefonoBloqueado}>
            <Text style={styles.telefonoTexto}>
              {telefonoUsuario || "Agrega un teléfono en tu perfil"}
            </Text>
          </View>
          <Text style={styles.ayudaTelefono}>
            Se toma automáticamente del perfil para evitar números incorrectos en el reporte.
          </Text>
        </View>

        <Boton texto="Guardar reporte" onPress={guardarReporte} />
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
    height: 150,
    borderRadius: 14,
    marginBottom: 6,
  },
  fotoTexto: {
    height: 75,
    textAlign: "center",
    textAlignVertical: "center",
    color: colores.gris,
    marginBottom: 6,
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
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 10,
  },
  cajaContacto: {
    backgroundColor: colores.blanco,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 10,
  },
  seccion: {
    color: colores.texto,
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
  },
  fila: {
    flexDirection: "row",
    gap: 8,
  },
  mitad: {
    flex: 1,
  },
  label: {
    color: colores.texto,
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 13,
  },
  telefonoBloqueado: {
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: colores.grisClaro,
    justifyContent: "center",
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  telefonoTexto: {
    color: colores.texto,
    fontWeight: "bold",
  },
  ayudaTelefono: {
    color: colores.gris,
    fontSize: 12,
    marginTop: 5,
    marginBottom: 2,
    lineHeight: 18,
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
});
