import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import CampoTexto from "../componentes/CampoTexto";
import Boton from "../componentes/Boton";
import BotonFlotante from "../componentes/BotonFlotante";
import AlertaBonita from "../componentes/AlertaBonita";
import { colores } from "../estilos/colores";
import {
  validarNombreCompleto,
  validarTelefono,
  limpiarTelefono,
} from "../utilidades/validacionesAutenticacion";
import { actualizarPerfilUsuario } from "../servicios/almacenamientoUsuario";

export default function Perfil({
  usuario,
  navigation,
  cerrarSesion,
  actualizarUsuario,
}) {
  const [editando, setEditando] = useState(false);
  const [nombreCompleto, setNombreCompleto] = useState(usuario?.nombreCompleto || "");
  const [telefono, setTelefono] = useState(usuario?.telefono || "");
  const [fotoPerfil, setFotoPerfil] = useState(usuario?.fotoPerfil || null);
  const [guardando, setGuardando] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const esAdmin = usuario?.rol === "admin";

  useEffect(() => {
    setNombreCompleto(usuario?.nombreCompleto || "");
    setTelefono(usuario?.telefono || "");
    setFotoPerfil(usuario?.fotoPerfil || null);
  }, [usuario?.id, usuario?.nombreCompleto, usuario?.telefono, usuario?.fotoPerfil]);

  const cerrarAlerta = () => setAlerta(null);

  const mostrarAlerta = (titulo, mensaje, tipo = "info", botones = []) => {
    setAlerta({ titulo, mensaje, tipo, botones });
  };

  const abrirFoto = () => {
    if (!fotoPerfil) return;
    navigation.navigate("VistaImagen", {
      uri: fotoPerfil,
      titulo: "Foto de perfil",
    });
  };

  const seleccionarFoto = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      mostrarAlerta("Permiso requerido", "Debes permitir acceso a la galería para elegir una foto.", "advertencia");
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!resultado.canceled) {
      setFotoPerfil(resultado.assets[0].uri);
      setEditando(true);
    }
  };

  const tomarFotoPerfil = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();

    if (!permiso.granted) {
      mostrarAlerta("Permiso requerido", "Debes permitir acceso a la cámara para tomar una foto.", "advertencia");
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!resultado.canceled) {
      setFotoPerfil(resultado.assets[0].uri);
      setEditando(true);
    }
  };

  const cancelarEdicion = () => {
    setNombreCompleto(usuario?.nombreCompleto || "");
    setTelefono(usuario?.telefono || "");
    setFotoPerfil(usuario?.fotoPerfil || null);
    setEditando(false);
  };

  const guardarCambios = async () => {
    if (!validarNombreCompleto(nombreCompleto)) {
      mostrarAlerta("Nombre incompleto", "Ingresa al menos tu nombre y apellido.", "advertencia");
      return;
    }

    if (!validarTelefono(telefono)) {
      mostrarAlerta(
        "Teléfono inválido",
        "El teléfono debe tener 10 dígitos. Ejemplo: 0999999999.",
        "advertencia"
      );
      return;
    }

    setGuardando(true);

    try {
      const usuarioActualizado = await actualizarPerfilUsuario({
        nombreCompleto: nombreCompleto.trim(),
        telefono: limpiarTelefono(telefono),
        fotoPerfil,
      });

      await actualizarUsuario(usuarioActualizado);
      setEditando(false);
      mostrarAlerta("Perfil actualizado", "Tus datos fueron guardados correctamente.", "exito");
    } catch (error) {
      mostrarAlerta(
        "No se pudo guardar",
        error.message || "Revisa tu conexión e inténtalo nuevamente.",
        "error"
      );
    } finally {
      setGuardando(false);
    }
  };

  const confirmarCerrarSesion = () => {
    mostrarAlerta(
      "Cerrar sesión",
      "¿Deseas salir de tu cuenta?",
      "advertencia",
      [
        { texto: "Cancelar", tipo: "secundario" },
        { texto: "Salir", tipo: "rojo", onPress: () => cerrarSesion(navigation) },
      ]
    );
  };

  return (
    <View style={styles.pantalla}>
      <ScrollView
        style={styles.contenedor}
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.avatar}
          onPress={abrirFoto}
          activeOpacity={fotoPerfil ? 0.85 : 1}
        >
          {fotoPerfil ? (
            <Image source={{ uri: fotoPerfil }} style={styles.foto} />
          ) : (
            <Text style={styles.avatarTexto}>
              {usuario?.nombreCompleto ? usuario.nombreCompleto.charAt(0).toUpperCase() : "U"}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.filaFotoBotones}>
          <View style={styles.botonFotoMitad}>
            <Boton texto="Galería" tipo="secundario" onPress={seleccionarFoto} />
          </View>
          <View style={styles.botonFotoMitad}>
            <Boton texto="Tomar foto" onPress={tomarFotoPerfil} />
          </View>
        </View>

        <View style={styles.caja}>
          {editando ? (
            <>
              <Text style={styles.seccion}>Editar datos</Text>

              <CampoTexto
                placeholder="Nombre completo"
                value={nombreCompleto}
                onChangeText={setNombreCompleto}
              />

              <CampoTexto
                placeholder="Teléfono"
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
                maxLength={10}
              />

              <Text style={styles.label}>Correo de acceso</Text>
              <Text style={styles.textoBloqueado}>{usuario?.correo || "No registrado"}</Text>

              <Boton texto="Guardar cambios" onPress={guardarCambios} cargando={guardando} />

              <Boton texto="Cancelar" tipo="secundario" onPress={cancelarEdicion} />
            </>
          ) : (
            <>
              <Text style={styles.label}>Nombre</Text>
              <Text style={styles.texto}>{usuario?.nombreCompleto || "Usuario"}</Text>

              <Text style={styles.label}>Teléfono</Text>
              <Text style={styles.texto}>{usuario?.telefono || "No registrado"}</Text>

              <Text style={styles.label}>Correo</Text>
              <Text style={styles.texto}>{usuario?.correo || "No registrado"}</Text>

              <Boton texto="Editar datos" tipo="secundario" onPress={() => setEditando(true)} />
            </>
          )}
        </View>

        <Boton texto="Cerrar sesión" tipo="rojo" onPress={confirmarCerrarSesion} />
      </ScrollView>

      {!esAdmin && <BotonFlotante onPress={() => navigation.navigate("CrearReporte")} />}

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
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: 14,
    paddingBottom: 130,
  },
  avatar: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: colores.principal,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 10,
    overflow: "hidden",
  },
  foto: {
    width: "100%",
    height: "100%",
  },
  avatarTexto: {
    fontSize: 42,
    fontWeight: "bold",
    color: colores.blanco,
  },
  filaFotoBotones: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 6,
  },
  botonFotoMitad: {
    flex: 1,
  },
  caja: {
    backgroundColor: colores.blanco,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    marginTop: 10,
    marginBottom: 12,
  },
  seccion: {
    color: colores.texto,
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
  },
  label: {
    fontWeight: "bold",
    color: colores.texto,
    marginTop: 7,
  },
  texto: {
    color: colores.gris,
    marginTop: 2,
    marginBottom: 5,
  },
  textoBloqueado: {
    color: colores.gris,
    backgroundColor: colores.grisClaro,
    borderRadius: 12,
    padding: 13,
    marginTop: 7,
    marginBottom: 7,
  },
});
