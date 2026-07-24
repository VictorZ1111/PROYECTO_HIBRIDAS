import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

import Boton from "../componentes/Boton";
import { colores } from "../estilos/colores";

export default function Bienvenida({ navigation }) {
  return (
    <View style={styles.contenedor}>
      <Image
        source={require("../../assets/icon.png")}
        style={styles.imagen}
        resizeMode="contain"
      />

      <Text style={styles.titulo}>¿ME HAS VISTO?</Text>

      <Text style={styles.subtitulo}>
        Reporta mascotas perdidas o encontradas y ayuda a reunirlas con sus familias.
      </Text>

      <Boton
        texto="Iniciar sesión"
        onPress={() => navigation.navigate("Login", { modoInicial: "inicio" })}
      />


      <Text style={styles.frase}>Una comunidad unida puede traerlos de vuelta.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
    justifyContent: "center",
    padding: 24,
    overflow: "hidden",
  },
  imagen: {
    width: "100%",
    height: 235,
    borderRadius: 30,
    marginBottom: 22,
  },
  titulo: {
    fontSize: 34,
    fontWeight: "bold",
    color: colores.principalOscuro,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: 16,
    color: colores.texto,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 23,
  },
  frase: {
    textAlign: "center",
    marginTop: 13,
    color: colores.gris,
  },
});
