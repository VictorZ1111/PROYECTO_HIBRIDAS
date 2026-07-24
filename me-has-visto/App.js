import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import Navegacion from "./src/navegacion/Navegacion.js";

const temaNavegacion = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
    card: "transparent",
  },
};

export default function App() {
  return (
    <View style={styles.fondo}>
      <Image
        source={require("./assets/paw-pattern.png")}
        style={[styles.patitas, styles.patitasSuperior]}
        resizeMode="contain"
        pointerEvents="none"
      />

      <Image
        source={require("./assets/paw-pattern.png")}
        style={[styles.patitas, styles.patitasInferior]}
        resizeMode="contain"
        pointerEvents="none"
      />

      <View style={styles.contenido}>
        <NavigationContainer theme={temaNavegacion}>
          <Navegacion />
        </NavigationContainer>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "#FDE7DA",
    overflow: "hidden",
  },
  contenido: {
    flex: 1,
    backgroundColor: "transparent",
  },
  patitas: {
    position: "absolute",
    opacity: 0.25,
  },
  patitasSuperior: {
    width: 440,
    height: 440,
    top: -95,
    right: -115,
  },
  patitasInferior: {
    width: 460,
    height: 460,
    bottom: -125,
    left: -145,
  },
});
