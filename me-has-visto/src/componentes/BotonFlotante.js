import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colores } from "../estilos/colores";

export default function BotonFlotante({ onPress }) {
  return (
    <TouchableOpacity style={styles.boton} onPress={onPress}>
      <Text style={styles.texto}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  boton: {
    position: "absolute",
    right: 16,
    bottom: 10,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colores.principalOscuro,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    borderWidth: 3,
    borderColor: colores.blanco,
    zIndex: 20,
  },
  texto: {
    color: colores.blanco,
    fontSize: 33,
    fontWeight: "bold",
    marginTop: -5,
  },
});