import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colores } from "../estilos/colores";

export default function Boton({
  texto,
  onPress,
  tipo = "principal",
  cargando = false,
  deshabilitado = false,
}) {
  const bloqueado = cargando || deshabilitado;

  return (
    <TouchableOpacity
      style={[
        styles.boton,
        tipo === "secundario" && styles.secundario,
        tipo === "rojo" && styles.rojo,
        tipo === "neutro" && styles.neutro,
        bloqueado && styles.deshabilitado,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={bloqueado}
    >
      {cargando ? (
        <ActivityIndicator color={colores.blanco} />
      ) : (
        <Text style={styles.texto}>{texto}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  boton: {
    backgroundColor: colores.principalOscuro,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    marginVertical: 6,
  },
  secundario: {
    backgroundColor: colores.secundario,
  },
  rojo: {
    backgroundColor: colores.rojo,
  },
  neutro: {
    backgroundColor: colores.gris,
  },
  deshabilitado: {
    opacity: 0.65,
  },
  texto: {
    color: colores.blanco,
    fontWeight: "bold",
    fontSize: 16,
  },
});
