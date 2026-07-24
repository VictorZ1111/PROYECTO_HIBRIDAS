import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colores } from "../estilos/colores";

function obtenerIcono(tipo) {
  if (tipo === "error") return "alert-circle";
  if (tipo === "exito") return "check-circle";
  if (tipo === "advertencia") return "alert";
  return "information";
}

export default function AlertaBonita({ visible, titulo, mensaje, tipo = "info", botones = [], onCerrar }) {
  const acciones = botones.length
    ? botones
    : [{ texto: "Entendido", tipo: "principal", onPress: onCerrar }];

  const cerrar = () => {
    if (onCerrar) onCerrar();
  };

  const ejecutarAccion = (accion) => {
    cerrar();
    if (accion?.onPress) {
      setTimeout(() => accion.onPress(), 80);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cerrar}>
      <View style={styles.fondoModal}>
        <View style={styles.tarjeta}>
          <View style={styles.iconoCaja}>
            <MaterialCommunityIcons name={obtenerIcono(tipo)} size={30} color={colores.blanco} />
          </View>

          <Text style={styles.titulo}>{titulo}</Text>
          {!!mensaje && <Text style={styles.mensaje}>{mensaje}</Text>}

          <View style={styles.botonesContenedor}>
            {acciones.map((accion, index) => (
              <TouchableOpacity
                key={`${accion.texto}-${index}`}
                style={[
                  styles.boton,
                  accion.tipo === "rojo" && styles.botonRojo,
                  accion.tipo === "secundario" && styles.botonSecundario,
                ]}
                onPress={() => ejecutarAccion(accion)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.textoBoton,
                    accion.tipo === "secundario" && styles.textoBotonSecundario,
                  ]}
                >
                  {accion.texto}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondoModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 22,
  },
  tarjeta: {
    width: "100%",
    backgroundColor: colores.blanco,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  iconoCaja: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colores.principalOscuro,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  titulo: {
    color: colores.texto,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  mensaje: {
    color: colores.gris,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  botonesContenedor: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  boton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: colores.principalOscuro,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  botonRojo: {
    backgroundColor: colores.rojo,
  },
  botonSecundario: {
    backgroundColor: colores.naranjaClaro,
  },
  textoBoton: {
    color: colores.blanco,
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  textoBotonSecundario: {
    color: colores.principalOscuro,
  },
});
