import React, { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Boton from "../componentes/Boton";
import AlertaBonita from "../componentes/AlertaBonita";
import VistaUbicacionMapa from "../componentes/VistaUbicacionMapa";
import { colores } from "../estilos/colores";

function obtenerCoordenadasReporte(reporte) {
  const latitude = Number(reporte?.latitud);
  const longitude = Number(reporte?.longitud);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

export default function DetalleReporte({
  route,
  navigation,
  usuario,
  marcarReporteEncontrado,
  eliminarReporteAdmin,
}) {
  const [reporte, setReporte] = useState(route.params?.reporte);
  const [alerta, setAlerta] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [observacionAdmin, setObservacionAdmin] = useState("");

  const esAdmin = usuario?.rol === "admin";
  const esPropio = useMemo(() => {
    return reporte?.usuarioId && usuario?.id
      ? String(reporte.usuarioId) === String(usuario.id)
      : reporte?.propio;
  }, [reporte, usuario]);

  const estadoInterno = reporte?.estadoReporte || "activo";
  const estaEncontrada = reporte?.estado === "Encontrada";
  const reporteDisponible = estadoInterno === "activo" && !estaEncontrada;
  const puedeEditar = esPropio && reporteDisponible && !esAdmin;
  const puedeMarcarEncontrada = esPropio && reporteDisponible && !esAdmin;
  const puedeInteractuar = !esAdmin && !esPropio && reporteDisponible;
  const puedeEliminarAdmin = esAdmin && estadoInterno !== "eliminado_admin";
  const coordenadas = obtenerCoordenadasReporte(reporte);

  const cerrarAlerta = () => setAlerta(null);
  const mostrarAlerta = (titulo, mensaje, tipo = "info", botones = []) => {
    setAlerta({ titulo, mensaje, tipo, botones });
  };

  const confirmarEncontrada = () => {
    mostrarAlerta(
      "Marcar como encontrada",
      "El reporte dejará de aparecer en el mapa y ya no recibirá nuevos contactos ni avistamientos.",
      "advertencia",
      [
        { texto: "Cancelar", tipo: "secundario" },
        {
          texto: "Confirmar",
          onPress: async () => {
            if (marcarReporteEncontrado) {
              const actualizado = await marcarReporteEncontrado(reporte);
              if (actualizado) {
                setReporte(actualizado);
              }
            }
          },
        },
      ]
    );
  };

  const abrirModalEliminarAdmin = () => {
    setObservacionAdmin("");
    setModalVisible(true);
  };

  const cerrarModalEliminarAdmin = () => {
    setModalVisible(false);
    setObservacionAdmin("");
  };

  const confirmarEliminarAdmin = async () => {
    if (!observacionAdmin.trim() || observacionAdmin.trim().length < 8) {
      mostrarAlerta("Observación requerida", "Escribe un motivo claro para el usuario.", "advertencia");
      return;
    }

    if (!eliminarReporteAdmin) {
      cerrarModalEliminarAdmin();
      return;
    }

    const actualizado = await eliminarReporteAdmin(reporte, observacionAdmin.trim());
    cerrarModalEliminarAdmin();

    if (actualizado) {
      setReporte(actualizado);
      mostrarAlerta("Reporte eliminado", "El reporte ya no se mostrará en el mapa y el usuario verá el motivo en sus avisos.", "exito");
    }
  };


  const verUbicacionReporte = () => {
    if (!coordenadas) {
      return;
    }

    navigation.navigate("SeleccionarUbicacionMapa", {
      modoLectura: true,
      titulo: "Ubicación del reporte",
      ayuda: "Este es el punto registrado para el reporte.",
      latitudInicial: coordenadas.latitude,
      longitudInicial: coordenadas.longitude,
      nombreMascota: reporte?.nombreMascota,
    });
  };

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.contenido}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => navigation.navigate("VistaImagen", { uri: reporte?.imagen, titulo: reporte?.nombreMascota || "Imagen del reporte" })}
      >
        <Image source={{ uri: reporte?.imagen }} style={styles.imagen} />
      </TouchableOpacity>

      <View style={styles.caja}>
        <Text style={styles.nombre}>{reporte?.nombreMascota}</Text>

        <View style={styles.filaEtiquetas}>
          <Text style={[styles.estado, estaEncontrada && styles.estadoEncontrada]}>{reporte?.estado}</Text>
          {estadoInterno !== "activo" ? (
            <Text style={styles.estadoInterno}>
              {estadoInterno === "eliminado_admin" ? "Eliminado" : estadoInterno}
            </Text>
          ) : null}
        </View>

        {reporte?.motivoAdmin ? (
          <View style={styles.avisoAdmin}>
            <Text style={styles.avisoAdminTitulo}>Aviso del administrador</Text>
            <Text style={styles.avisoAdminTexto}>{reporte.motivoAdmin}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Mascota</Text>
        <Text style={styles.texto}>{reporte?.tipoMascota || reporte?.tipo || "No especificada"}</Text>

        <Text style={styles.label}>Raza</Text>
        <Text style={styles.texto}>{reporte?.raza || "No especificada"}</Text>

        <Text style={styles.label}>Color</Text>
        <Text style={styles.texto}>{reporte?.color || "No especificado"}</Text>

        <Text style={styles.label}>Descripción</Text>
        <Text style={styles.texto}>{reporte?.descripcion || "Sin descripción"}</Text>

        <Text style={styles.label}>Provincia</Text>
        <Text style={styles.texto}>{reporte?.provincia || "No registrada"}</Text>

        <Text style={styles.label}>Ciudad</Text>
        <Text style={styles.texto}>{reporte?.ciudad || "No registrada"}</Text>

        <Text style={styles.label}>Sector o referencia</Text>
        <Text style={styles.texto}>{reporte?.sector || "No registrada"}</Text>

        <Text style={styles.label}>Teléfono de contacto</Text>
        <Text style={styles.texto}>{reporte?.telefono || "No registrado"}</Text>

        <Text style={styles.label}>Fecha del reporte</Text>
        <Text style={styles.texto}>{reporte?.fecha || "No registrada"}</Text>

        {reporte?.usuario ? (
          <View style={styles.usuarioReporteCaja}>
            <View style={styles.usuarioReporteHeader}>
              <View style={styles.avatarUsuarioReporte}>
                <Text style={styles.avatarUsuarioReporteTexto}>
                  {(reporte.usuario.nombreCompleto || "U").charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.usuarioReporteInfo}>
                <Text style={styles.usuarioReporteTitulo}>Usuario que realizó el reporte</Text>
                <Text style={styles.usuarioReporteNombre}>{reporte.usuario.nombreCompleto || "Usuario"}</Text>
                <Text style={styles.usuarioReporteDato}>{reporte.usuario.correo || "Correo no registrado"}</Text>
                <Text style={styles.usuarioReporteDato}>{reporte.usuario.telefono || "Teléfono no registrado"}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {reporte?.fechaEncontrada ? (
          <>
            <Text style={styles.label}>Fecha encontrada</Text>
            <Text style={styles.texto}>{reporte.fechaEncontrada}</Text>
          </>
        ) : null}

        {coordenadas ? (
          <View style={styles.mapaPreview}>
            <Text style={styles.label}>Ubicación del reporte</Text>
            <VistaUbicacionMapa coordenadas={coordenadas} textoVacio="Ubicación registrada" />
            <View style={styles.accionesExtra}>
              <Boton texto="Ver ubicación" tipo="secundario" onPress={verUbicacionReporte} />
            </View>
          </View>
        ) : null}

        {puedeEditar ? (
          <View style={styles.accionesExtra}>
            <Boton
              texto="Editar reporte"
              tipo="secundario"
              onPress={() => navigation.navigate("EditarReporte", { reporte })}
            />
          </View>
        ) : null}

        {puedeMarcarEncontrada ? (
          <View style={styles.accionesExtra}>
            <Boton texto="Marcar como encontrada" onPress={confirmarEncontrada} />
          </View>
        ) : null}

        {puedeEliminarAdmin ? (
          <View style={styles.accionesExtra}>
            <Boton texto="Eliminar reporte" tipo="rojo" onPress={abrirModalEliminarAdmin} />
          </View>
        ) : null}

        {puedeInteractuar ? (
          <>
            <Boton
              texto="Contactar"
              tipo="secundario"
              onPress={() => navigation.navigate("Chat", { reporte })}
            />
            <Boton
              texto="Reportar avistamiento"
              onPress={() => navigation.navigate("ReportarAvistamiento", { reporte })}
            />
          </>
        ) : null}

      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={cerrarModalEliminarAdmin}>
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>Eliminar reporte</Text>
            <Text style={styles.modalTexto}>
              Escribe el motivo que verá el usuario en sus avisos.
            </Text>

            <TextInput
              style={styles.inputObservacion}
              placeholder="Ejemplo: El reporte contiene información sensible o inapropiada."
              placeholderTextColor={colores.gris}
              multiline
              value={observacionAdmin}
              onChangeText={setObservacionAdmin}
            />

            <View style={styles.modalAcciones}>
              <View style={styles.botonModal}>
                <Boton texto="Cancelar" tipo="secundario" onPress={cerrarModalEliminarAdmin} />
              </View>
              <View style={styles.botonModal}>
                <Boton texto="Eliminar" tipo="rojo" onPress={confirmarEliminarAdmin} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <AlertaBonita
        visible={!!alerta}
        tipo={alerta?.tipo}
        titulo={alerta?.titulo}
        mensaje={alerta?.mensaje}
        botones={alerta?.botones}
        onCerrar={cerrarAlerta}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    paddingBottom: 120,
  },
  imagen: {
    width: "100%",
    height: 280,
    backgroundColor: colores.grisClaro,
  },
  caja: {
    backgroundColor: colores.blanco,
    margin: 16,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  nombre: {
    fontSize: 30,
    fontWeight: "bold",
    color: colores.texto,
  },
  filaEtiquetas: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  estado: {
    alignSelf: "flex-start",
    backgroundColor: colores.naranjaClaro,
    color: colores.principalOscuro,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: "bold",
  },
  estadoEncontrada: {
    backgroundColor: colores.verdeClaro,
    color: colores.secundario,
  },
  estadoInterno: {
    alignSelf: "flex-start",
    backgroundColor: colores.grisClaro,
    color: colores.texto,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  avisoAdmin: {
    backgroundColor: colores.naranjaClaro,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  avisoAdminTitulo: {
    color: colores.principalOscuro,
    fontWeight: "bold",
    marginBottom: 3,
  },
  avisoAdminTexto: {
    color: colores.texto,
    lineHeight: 19,
  },
  label: {
    fontWeight: "bold",
    color: colores.texto,
    marginTop: 12,
  },
  texto: {
    color: colores.gris,
    marginTop: 3,
    lineHeight: 21,
  },
  usuarioReporteCaja: {
    backgroundColor: colores.naranjaClaro,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    marginBottom: 8,
  },
  usuarioReporteHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarUsuarioReporte: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colores.principalOscuro,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarUsuarioReporteTexto: {
    color: colores.blanco,
    fontWeight: "bold",
    fontSize: 18,
  },
  usuarioReporteInfo: {
    flex: 1,
  },
  usuarioReporteTitulo: {
    color: colores.principalOscuro,
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 3,
  },
  usuarioReporteNombre: {
    color: colores.texto,
    fontWeight: "bold",
    fontSize: 15,
  },
  usuarioReporteDato: {
    color: colores.gris,
    fontSize: 12,
    marginTop: 1,
  },
  mapaPreview: {
    marginTop: 10,
    marginBottom: 4,
  },
  accionesExtra: {
    marginTop: 12,
  },
  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 18,
  },
  modalCaja: {
    backgroundColor: colores.blanco,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  modalTitulo: {
    color: colores.texto,
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 4,
  },
  modalTexto: {
    color: colores.gris,
    lineHeight: 19,
    marginBottom: 12,
  },
  inputObservacion: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 16,
    backgroundColor: colores.fondo,
    padding: 14,
    color: colores.texto,
    textAlignVertical: "top",
  },
  modalAcciones: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  botonModal: {
    flex: 1,
  },
});
