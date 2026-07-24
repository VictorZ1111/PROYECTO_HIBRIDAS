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
import { actualizarReporteApi } from "../servicios/almacenamientoReportes";

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

export default function EditarReporte({
  route,
  navigation,
  reportes,
  actualizarReportes,
  usuario,
}) {
  const { reporte } = route.params;
  const insets = useSafeAreaInsets();
  const esPropio =
    reporte?.usuarioId && usuario?.id
      ? String(reporte.usuarioId) === String(usuario.id)
      : reporte?.propio;
  const estadoInterno = reporte?.estadoReporte || "activo";
  const puedeEditar = esPropio && estadoInterno === "activo" && reporte?.estado !== "Encontrada";

  const [nombreMascota, setNombreMascota] = useState(reporte?.nombreMascota || "");
  const [tipoMascota, setTipoMascota] = useState(reporte?.tipoMascota || "");
  const [raza, setRaza] = useState(reporte?.raza || "");
  const [color, setColor] = useState(reporte?.color || "");
  const [descripcion, setDescripcion] = useState(reporte?.descripcion || "");
  const [provincia, setProvincia] = useState(reporte?.provincia || "");
  const [ciudad, setCiudad] = useState(reporte?.ciudad || "");
  const [sector, setSector] = useState(reporte?.sector || "");
  const [imagen, setImagen] = useState(reporte?.imagen || null);
  const [latitudSeleccionada, setLatitudSeleccionada] = useState(reporte?.latitud ?? null);
  const [longitudSeleccionada, setLongitudSeleccionada] = useState(reporte?.longitud ?? null);
  const [tokenSeleccionMapa, setTokenSeleccionMapa] = useState(null);
  const [alerta, setAlerta] = useState(null);

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
    const token = `editar-reporte-${Date.now()}`;
    setTokenSeleccionMapa(token);

    navigation.navigate("SeleccionarUbicacionMapa", {
      token,
      titulo: "Ubicación del reporte",
      ayuda: "Toca el mapa para cambiar el punto del reporte. También puedes usar tu ubicación actual desde el mapa.",
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

  const guardarCambios = async () => {
    if (!puedeEditar) {
      mostrarAlerta("Sin permiso", "Solo puedes editar tus reportes activos y no encontrados.", "advertencia");
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
      mostrarAlerta("Campos incompletos", "Completa los datos principales.", "advertencia");
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

    const reporteActualizado = {
      ...reporte,
      nombreMascota: nombreMascota.trim(),
      tipoMascota: tipoMascota.trim(),
      raza: raza.trim() || "No especificada",
      color: color.trim(),
      descripcion: descripcion.trim(),
      provincia: provincia.trim(),
      ciudad: ciudad.trim(),
      sector: sector.trim(),
      telefono: reporte.telefono || usuario?.telefono || "",
      imagen:
        imagen ||
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=900",
      latitud: coordenadas?.latitude || null,
      longitud: coordenadas?.longitude || null,
      sincronizado: false,
      pendienteSincronizacion: true,
      actualizadoEn: new Date().toISOString(),
    };

    try {
      const reporteGuardado = await actualizarReporteApi(reporte.id, reporteActualizado);

      const nuevosReportes = reportes.map((item) =>
        String(item.id) === String(reporte.id) ? reporteGuardado : item
      );

      await actualizarReportes(nuevosReportes);

      mostrarAlerta("Reporte actualizado", "Los cambios fueron guardados correctamente.", "exito", [
        { texto: "Continuar", onPress: () => navigation.navigate("DetalleReporte", { reporte: reporteGuardado }) },
      ]);
    } catch (error) {
      mostrarAlerta(
        "No se pudo actualizar",
        error.message || "Revisa tu conexión e inténtalo nuevamente.",
        "error"
      );
    }
  };

  if (!puedeEditar) {
    return (
      <View style={styles.pantallaBloqueada}>
        <Text style={styles.tituloBloqueado}>No editable</Text>
        <Text style={styles.textoBloqueado}>
          Solo el usuario que creó el reporte puede editarlo mientras esté activo y pendiente de encontrar.
        </Text>
        <Boton texto="Volver" tipo="secundario" onPress={() => navigation.goBack()} />
      </View>
    );
  }

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
            Puedes mantener la ubicación guardada o cambiarla seleccionando un nuevo punto en el mapa integrado.
          </Text>

          <VistaUbicacionMapa
            coordenadas={ubicacionLista ? coordenadasActuales : null}
            textoVacio="Puedes conservar el reporte sin ubicación exacta o marcar un punto nuevo en el mapa."
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
            <Text style={styles.telefonoTexto}>{reporte.telefono || usuario?.telefono || "No registrado"}</Text>
          </View>
          <Text style={styles.ayudaTelefono}>El número se mantiene desde el perfil del usuario.</Text>
        </View>

        <Boton texto="Guardar cambios" onPress={guardarCambios} />
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
  pantallaBloqueada: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colores.fondo,
    padding: 20,
  },
  tituloBloqueado: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: colores.texto,
  },
  textoBloqueado: {
    color: colores.gris,
    textAlign: "center",
    lineHeight: 21,
    marginVertical: 12,
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
