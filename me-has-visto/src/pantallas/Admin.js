import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AlertaBonita from "../componentes/AlertaBonita";
import { colores } from "../estilos/colores";
import {
  cambiarEstadoUsuarioRegistrado,
  eliminarUsuarioRegistrado,
  obtenerUsuariosRegistradosParaAdmin,
} from "../servicios/almacenamientoUsuario";

export default function Admin({ reportes, actualizarReportes }) {
  const [usuarios, setUsuarios] = useState([]);
  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    const lista = await obtenerUsuariosRegistradosParaAdmin();
    setUsuarios(lista);
  };

  const estadisticas = useMemo(() => {
    return {
      usuarios: usuarios.filter((usuario) => usuario.rol !== "admin").length,
      reportes: reportes.length,
    };
  }, [reportes, usuarios]);

  const cerrarAlerta = () => setAlerta(null);

  const mostrarAlerta = (titulo, mensaje, tipo = "info", botones = []) => {
    setAlerta({ titulo, mensaje, tipo, botones });
  };

  const confirmarCambioEstado = (usuario, nuevoEstado) => {
    if (usuario.rol === "admin") {
      mostrarAlerta("Acción bloqueada", "La cuenta administrativa del sistema no se modifica.", "advertencia");
      return;
    }

    const accion = nuevoEstado === "activo" ? "activar" : "inactivar";

    mostrarAlerta(
      `${accion.charAt(0).toUpperCase()}${accion.slice(1)} usuario`,
      `¿Deseas ${accion} la cuenta de ${usuario.nombreCompleto}?`,
      "advertencia",
      [
        { texto: "Cancelar", tipo: "secundario" },
        {
          texto: accion.charAt(0).toUpperCase() + accion.slice(1),
          onPress: async () => {
            await cambiarEstadoUsuarioRegistrado(usuario.id, nuevoEstado);
            await cargarUsuarios();
          },
        },
      ]
    );
  };

  const confirmarEliminarUsuario = (usuario) => {
    if (usuario.rol === "admin") {
      mostrarAlerta("Acción bloqueada", "La cuenta administrativa del sistema no se elimina.", "advertencia");
      return;
    }

    mostrarAlerta(
      "Eliminar usuario",
      `Se eliminará definitivamente a ${usuario.nombreCompleto} y también sus reportes, avistamientos y contactos asociados.`,
      "advertencia",
      [
        { texto: "Cancelar", tipo: "secundario" },
        {
          texto: "Eliminar",
          tipo: "rojo",
          onPress: async () => {
            await eliminarUsuarioRegistrado(usuario.id);

            const reportesActualizados = reportes.filter(
              (reporte) => String(reporte.usuarioId) !== String(usuario.id)
            );

            await actualizarReportes(reportesActualizados);
            await cargarUsuarios();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cabecera}>
        <View style={styles.iconoCabecera}>
          <MaterialCommunityIcons name="account-group-outline" size={28} color={colores.blanco} />
        </View>
        <View style={styles.infoCabecera}>
          <Text style={styles.titulo}>Usuarios del sistema</Text>
          <Text style={styles.descripcion}>
            Control de cuentas registradas y acceso de usuarios.
          </Text>
        </View>
      </View>

      <View style={styles.gridStats}>
        <TarjetaStat titulo="Usuarios" valor={estadisticas.usuarios} />
        <TarjetaStat titulo="Reportes" valor={estadisticas.reportes} />
      </View>

      <View style={styles.caja}>
        <Text style={styles.subtitulo}>Usuarios registrados</Text>

        {usuarios.map((usuario) => {
          const esAdmin = usuario.rol === "admin";
          const estaActivo = (usuario.estadoCuenta || "activo") === "activo";

          return (
            <View key={usuario.id || usuario.correo} style={styles.filaUsuario}>
              <View style={styles.avatarUsuario}>
                <Text style={styles.avatarTexto}>
                  {(usuario.nombreCompleto || "U").charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.infoUsuario}>
                <Text style={styles.nombreUsuario}>{usuario.nombreCompleto}</Text>
                <Text style={styles.correoUsuario}>{usuario.correo}</Text>
                <Text style={styles.telefonoUsuario}>{usuario.telefono || "Sin teléfono"}</Text>
                <Text style={[styles.estadoCuenta, !estaActivo && styles.estadoCuentaInactivo]}>
                  {esAdmin ? "Sistema" : estaActivo ? "Activo" : "Inactivo"}
                </Text>
              </View>

              {!esAdmin && (
                <View style={styles.accionesUsuario}>
                  <TouchableOpacity
                    style={[styles.botonCircular, estaActivo ? styles.botonInactivar : styles.botonActivar]}
                    onPress={() => confirmarCambioEstado(usuario, estaActivo ? "inactivo" : "activo")}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons
                      name={estaActivo ? "account-off-outline" : "account-check-outline"}
                      size={19}
                      color={colores.blanco}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.botonCircular, styles.botonEliminarUsuario]}
                    onPress={() => confirmarEliminarUsuario(usuario)}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons name="trash-can-outline" size={19} color={colores.blanco} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </View>

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

function TarjetaStat({ titulo, valor }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.valorStat}>{valor}</Text>
      <Text style={styles.tituloStat}>{titulo}</Text>
    </View>
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
    fontSize: 21,
    fontWeight: "bold",
    color: colores.texto,
  },
  descripcion: {
    color: colores.gris,
    lineHeight: 19,
    marginTop: 4,
    fontSize: 13,
  },
  gridStats: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: colores.blanco,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 15,
    minHeight: 86,
    justifyContent: "center",
  },
  valorStat: {
    fontSize: 28,
    fontWeight: "bold",
    color: colores.principalOscuro,
    textAlign: "center",
  },
  tituloStat: {
    color: colores.gris,
    fontSize: 13,
    textAlign: "center",
    marginTop: 3,
    fontWeight: "bold",
  },
  caja: {
    backgroundColor: colores.blanco,
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 12,
  },
  subtitulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: colores.texto,
    marginBottom: 5,
  },
  filaUsuario: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colores.grisClaro,
    paddingVertical: 11,
  },
  avatarUsuario: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colores.principal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarTexto: {
    color: colores.blanco,
    fontWeight: "bold",
    fontSize: 17,
  },
  infoUsuario: {
    flex: 1,
  },
  nombreUsuario: {
    color: colores.texto,
    fontWeight: "bold",
  },
  correoUsuario: {
    color: colores.gris,
    fontSize: 12,
    marginTop: 2,
  },
  telefonoUsuario: {
    color: colores.gris,
    fontSize: 12,
    marginTop: 2,
  },
  estadoCuenta: {
    alignSelf: "flex-start",
    marginTop: 5,
    backgroundColor: colores.verdeClaro,
    color: colores.secundario,
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  estadoCuentaInactivo: {
    backgroundColor: colores.grisClaro,
    color: colores.gris,
  },
  accionesUsuario: {
    flexDirection: "row",
    gap: 7,
    marginLeft: 8,
  },
  botonCircular: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  botonActivar: {
    backgroundColor: colores.secundario,
  },
  botonInactivar: {
    backgroundColor: colores.principal,
  },
  botonEliminarUsuario: {
    backgroundColor: colores.rojo,
  },
});
