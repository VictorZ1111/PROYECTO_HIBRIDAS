import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Boton from "../componentes/Boton";
import { colores } from "../estilos/colores";

export default function Registro({ navigation }) {
  return (
    <View style={styles.pantalla}>
      <View style={styles.caja}>
        <Text style={styles.titulo}>Registro</Text>
        <Text style={styles.texto}>
          El registro se realiza desde la pantalla de inicio de sesión.
        </Text>
        <Boton
          texto="Ir a iniciar sesión"
          onPress={() => navigation.navigate("Login", { modoInicial: "registro" })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
    justifyContent: "center",
    padding: 18,
  },
  caja: {
    backgroundColor: colores.blanco,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 18,
  },
  titulo: {
    color: colores.texto,
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 8,
  },
  texto: {
    color: colores.gris,
    lineHeight: 20,
    marginBottom: 12,
  },
});
