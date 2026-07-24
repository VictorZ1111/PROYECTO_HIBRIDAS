import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colores } from "../estilos/colores";
import { obtenerRequisitosContrasena } from "../utilidades/validacionesAutenticacion";

const requisitos = [
  ["longitud", "Entre 8 y 10 caracteres"],
  ["mayuscula", "Una letra mayúscula"],
  ["minuscula", "Una letra minúscula"],
  ["numero", "Un número"],
  ["especial", "Un carácter especial"],
];

export default function RequisitosContrasena({ contrasena }) {
  const estado = obtenerRequisitosContrasena(contrasena);

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>La contraseña debe incluir:</Text>

      {requisitos.map(([clave, texto]) => {
        const cumplido = estado[clave];

        return (
          <View key={clave} style={styles.fila}>
            <Ionicons
              name={cumplido ? "checkmark-circle" : "ellipse-outline"}
              size={17}
              color={cumplido ? colores.secundario : colores.gris}
            />
            <Text style={[styles.texto, cumplido && styles.textoCumplido]}>
              {texto}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    marginTop: 3,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  titulo: {
    color: colores.texto,
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 5,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  texto: {
    marginLeft: 7,
    color: colores.gris,
    fontSize: 12,
  },
  textoCumplido: {
    color: colores.secundario,
  },
});
