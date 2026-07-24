import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import TarjetaReporte from "../componentes/TarjetaReporte";
import Boton from "../componentes/Boton";
import BotonFlotante from "../componentes/BotonFlotante";
import AlertaBonita from "../componentes/AlertaBonita";
import { colores } from "../estilos/colores";
import { eliminarReporteApi } from "../servicios/almacenamientoReportes";

export default function MisReportes({
  navigation,
  reportes,
  usuario,
  actualizarReportes,
}) {
  const [alerta, setAlerta] = useState(null);

  const misReportes = reportes.filter((reporte) => {
    if (reporte.usuarioId && usuario?.id) {
      return String(reporte.usuarioId) === String(usuario.id);
    }

    return reporte.propio;
  });

  const cerrarAlerta = () => setAlerta(null);

  const mostrarAlerta = (titulo, mensaje, tipo = "info", botones = []) => {
    setAlerta({ titulo, mensaje, tipo, botones });
  };

  const eliminarReporte = (id) => {
    mostrarAlerta(
      "Eliminar reporte",
      "¿Seguro que deseas eliminar este reporte?",
      "advertencia",
      [
        { texto: "Cancelar", tipo: "secundario" },
        {
          texto: "Eliminar",
          tipo: "rojo",
          onPress: async () => {
            try {
              await eliminarReporteApi(id);
              const nuevosReportes = reportes.filter(
                (reporte) => String(reporte.id) !== String(id)
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

  const puedeEditar = (reporte) =>
    (reporte.estadoReporte || "activo") === "activo" && reporte.estado !== "Encontrada";

  return (
    <View style={styles.pantalla}>
      <View style={styles.contenedor}>
        {misReportes.length === 0 ? (
          <View style={styles.vacio}>
            <Text style={styles.textoVacio}>Todavía no has creado reportes.</Text>
          </View>
        ) : (
          <FlatList
            data={misReportes}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.lista}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <TarjetaReporte
                  reporte={item}
                  onPress={() => navigation.navigate("DetalleReporte", { reporte: item })}
                />

                {item.motivoAdmin ? (
                  <View style={styles.avisoAdmin}>
                    <Text style={styles.avisoAdminTitulo}>Aviso del administrador</Text>
                    <Text style={styles.avisoAdminTexto}>{item.motivoAdmin}</Text>
                  </View>
                ) : null}

                {puedeEditar(item) ? (
                  <View style={styles.acciones}>
                    <View style={styles.botonAccion}>
                      <Boton
                        texto="Editar"
                        tipo="secundario"
                        onPress={() => navigation.navigate("EditarReporte", { reporte: item })}
                      />
                    </View>

                    <View style={styles.botonAccion}>
                      <Boton texto="Eliminar" tipo="rojo" onPress={() => eliminarReporte(item.id)} />
                    </View>
                  </View>
                ) : (
                  <Text style={styles.estadoCerrado}>
                    {item.estado === "Encontrada" ? "Encontrado" : "Bloqueado por administración"}
                  </Text>
                )}
              </View>
            )}
          />
        )}
      </View>

      <BotonFlotante onPress={() => navigation.navigate("CrearReporte")} />

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
    padding: 14,
  },
  lista: {
    paddingBottom: 112,
  },
  vacio: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 80,
  },
  textoVacio: {
    textAlign: "center",
    color: colores.gris,
    fontSize: 15,
  },
  item: {
    marginBottom: 12,
  },
  acciones: {
    flexDirection: "row",
    gap: 10,
  },
  botonAccion: {
    flex: 1,
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
  estadoCerrado: {
    color: colores.gris,
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 4,
  },
});
