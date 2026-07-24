import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TarjetaReporte from "../componentes/TarjetaReporte";
import Boton from "../componentes/Boton";
import SelectorDesplegable from "../componentes/SelectorDesplegable";
import AlertaBonita from "../componentes/AlertaBonita";
import { colores } from "../estilos/colores";
import { eliminarReporteAdminApi } from "../servicios/almacenamientoReportes";
import {
  PROVINCIAS_ECUADOR,
  obtenerCiudadesPorProvincia,
  normalizarUbicacion,
} from "../utilidades/ubicacionesEcuador";

const ESTADOS_MASCOTA_ADMIN = ["Todos", "Perdida", "Encontrada", "Eliminado"];

function ordenarPorFecha(lista) {
  return [...lista].sort((a, b) => {
    const fechaA = new Date(a.actualizadoEn || a.creadoEn || 0).getTime();
    const fechaB = new Date(b.actualizadoEn || b.creadoEn || 0).getTime();
    return fechaB - fechaA;
  });
}

export default function AdminReportes({ navigation, reportes, actualizarReportes }) {
  const [provincia, setProvincia] = useState("Todos");
  const [ciudad, setCiudad] = useState("Todos");
  const [estado, setEstado] = useState("Todos");
  const [modalVisible, setModalVisible] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [observacion, setObservacion] = useState("");
  const [alerta, setAlerta] = useState(null);

  const ciudades = useMemo(() => {
    if (provincia === "Todos") {
      return ["Todos"];
    }

    return ["Todos", ...obtenerCiudadesPorProvincia(provincia)];
  }, [provincia]);

  const reportesFiltrados = useMemo(() => {
    const filtrados = reportes.filter((reporte) => {
      const cumpleProvincia =
        provincia === "Todos" || normalizarUbicacion(reporte.provincia) === normalizarUbicacion(provincia);
      const cumpleCiudad =
        ciudad === "Todos" || normalizarUbicacion(reporte.ciudad) === normalizarUbicacion(ciudad);
      const cumpleEstado =
        estado === "Todos"
          ? true
          : estado === "Eliminado"
            ? reporte.estadoReporte === "eliminado_admin"
            : reporte.estado === estado;

      return cumpleProvincia && cumpleCiudad && cumpleEstado;
    });

    return ordenarPorFecha(filtrados);
  }, [reportes, provincia, ciudad, estado]);

  const cerrarAlerta = () => setAlerta(null);

  const mostrarAlerta = (titulo, mensaje, tipo = "info", botones = []) => {
    setAlerta({ titulo, mensaje, tipo, botones });
  };

  const limpiarFiltros = () => {
    setProvincia("Todos");
    setCiudad("Todos");
    setEstado("Todos");
  };

  const abrirModalEliminar = (reporte) => {
    if (reporte.estadoReporte === "eliminado_admin") {
      return;
    }

    setReporteSeleccionado(reporte);
    setObservacion("");
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setReporteSeleccionado(null);
    setObservacion("");
  };

  const confirmarEliminarReporte = async () => {
    if (!observacion.trim() || observacion.trim().length < 8) {
      mostrarAlerta("Observación requerida", "Escribe un motivo claro para el usuario.", "advertencia");
      return;
    }

    cerrarModal();

    mostrarAlerta(
      "Eliminar reporte",
      "El reporte dejará de mostrarse en el mapa y el usuario verá el motivo en sus avisos.",
      "advertencia",
      [
        { texto: "Cancelar", tipo: "secundario" },
        {
          texto: "Eliminar",
          tipo: "rojo",
          onPress: async () => {
            try {
              const reporteActualizado = await eliminarReporteAdminApi(
                reporteSeleccionado.id,
                observacion.trim()
              );

              const nuevosReportes = reportes.map((reporte) =>
                String(reporte.id) === String(reporteSeleccionado.id) ? reporteActualizado : reporte
              );

              await actualizarReportes(nuevosReportes);
            } catch (error) {
              mostrarAlerta(
                "No se pudo eliminar",
                error.message || "Revisa tu conexión e inténtalo nuevamente.",
                "error"
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.pantalla}>
      <ScrollView
        style={styles.contenedor}
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cabecera}>
          <View style={styles.iconoCabecera}>
            <MaterialCommunityIcons name="file-document-alert-outline" size={27} color={colores.blanco} />
          </View>
          <View style={styles.infoCabecera}>
            <Text style={styles.titulo}>Reportes administrativos</Text>
            <Text style={styles.descripcion}>
              Revisa reportes y oculta contenido que no sea adecuado.
            </Text>
          </View>
        </View>

        <View style={styles.cajaFiltros}>
          <View style={styles.filaEntre}>
            <Text style={styles.subtitulo}>Filtros</Text>
            <TouchableOpacity style={styles.botonLimpiar} onPress={limpiarFiltros} activeOpacity={0.85}>
              <MaterialCommunityIcons name="broom" size={22} color={colores.principalOscuro} />
            </TouchableOpacity>
          </View>

          <View style={styles.filaFiltros}>
            <View style={styles.filtroMitad}>
              <SelectorDesplegable
                etiqueta="Provincia"
                valor={provincia}
                opciones={["Todos", ...PROVINCIAS_ECUADOR]}
                onChange={(valor) => {
                  setProvincia(valor);
                  setCiudad("Todos");
                }}
              />
            </View>

            <View style={styles.filtroMitad}>
              <SelectorDesplegable
                etiqueta="Ciudad"
                valor={ciudad}
                opciones={ciudades}
                onChange={setCiudad}
                deshabilitado={provincia === "Todos"}
              />
            </View>
          </View>

          <SelectorDesplegable
            etiqueta="Estado"
            valor={estado}
            opciones={ESTADOS_MASCOTA_ADMIN}
            onChange={setEstado}
          />
        </View>

        <Text style={styles.resultadoTexto}>{reportesFiltrados.length} reporte(s) encontrados</Text>

        {reportesFiltrados.length === 0 ? (
          <View style={styles.vacio}>
            <Text style={styles.textoVacio}>No hay reportes con estos filtros.</Text>
          </View>
        ) : (
          reportesFiltrados.map((reporte) => {
            const eliminado = reporte.estadoReporte === "eliminado_admin";

            return (
              <View key={reporte.id} style={styles.itemReporte}>
                <TarjetaReporte
                  reporte={reporte}
                  onPress={() => navigation.navigate("DetalleReporte", { reporte })}
                />

                {reporte.motivoAdmin ? (
                  <View style={styles.avisoAdmin}>
                    <Text style={styles.avisoAdminTitulo}>Motivo registrado</Text>
                    <Text style={styles.avisoAdminTexto}>{reporte.motivoAdmin}</Text>
                  </View>
                ) : null}

                <View style={styles.accionesReporte}>
                  <View style={styles.botonAccion}>
                    <Boton
                      texto="Ver reporte"
                      tipo="secundario"
                      onPress={() => navigation.navigate("DetalleReporte", { reporte })}
                    />
                  </View>

                  {!eliminado && (
                    <View style={styles.botonAccion}>
                      <Boton
                        texto="Eliminar"
                        tipo="rojo"
                        onPress={() => abrirModalEliminar(reporte)}
                      />
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={cerrarModal}>
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>Motivo de eliminación</Text>
            <Text style={styles.modalTexto}>
              Este mensaje aparecerá al usuario como aviso del administrador.
            </Text>

            <TextInput
              style={styles.inputObservacion}
              placeholder="Ejemplo: El reporte contiene información sensible o inapropiada."
              placeholderTextColor={colores.gris}
              value={observacion}
              onChangeText={setObservacion}
              multiline
            />

            <View style={styles.modalAcciones}>
              <View style={styles.botonModal}>
                <Boton texto="Cancelar" tipo="secundario" onPress={cerrarModal} />
              </View>
              <View style={styles.botonModal}>
                <Boton texto="Continuar" tipo="rojo" onPress={confirmarEliminarReporte} />
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
    fontSize: 20,
    fontWeight: "bold",
    color: colores.texto,
  },
  descripcion: {
    color: colores.gris,
    lineHeight: 19,
    marginTop: 4,
    fontSize: 13,
  },
  cajaFiltros: {
    backgroundColor: colores.blanco,
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 10,
  },
  filaEntre: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  subtitulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: colores.texto,
    marginBottom: 8,
  },
  botonLimpiar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colores.naranjaClaro,
    justifyContent: "center",
    alignItems: "center",
  },
  filaFiltros: {
    flexDirection: "row",
    gap: 10,
  },
  filtroMitad: {
    flex: 1,
  },
  resultadoTexto: {
    color: colores.gris,
    fontWeight: "bold",
    marginBottom: 8,
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
  itemReporte: {
    marginBottom: 14,
  },
  avisoAdmin: {
    backgroundColor: colores.naranjaClaro,
    borderRadius: 14,
    padding: 11,
    marginTop: -2,
    marginBottom: 8,
  },
  avisoAdminTitulo: {
    color: colores.principalOscuro,
    fontWeight: "bold",
    marginBottom: 2,
  },
  avisoAdminTexto: {
    color: colores.texto,
    lineHeight: 19,
    fontSize: 13,
  },
  accionesReporte: {
    flexDirection: "row",
    gap: 10,
  },
  botonAccion: {
    flex: 1,
  },
  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalCaja: {
    backgroundColor: colores.blanco,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  modalTitulo: {
    color: colores.texto,
    fontWeight: "bold",
    fontSize: 19,
  },
  modalTexto: {
    color: colores.gris,
    lineHeight: 19,
    fontSize: 13,
    marginTop: 5,
    marginBottom: 10,
  },
  inputObservacion: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 14,
    padding: 12,
    color: colores.texto,
    textAlignVertical: "top",
    backgroundColor: colores.fondo,
  },
  modalAcciones: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  botonModal: {
    flex: 1,
  },
});
