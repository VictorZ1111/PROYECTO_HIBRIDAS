import React from "react";
import { View, StyleSheet, Image, TouchableOpacity, StatusBar, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colores } from "../estilos/colores";

export default function VistaImagen({ route, navigation }) {
  const uri = route.params?.uri;

  return (
    <View style={styles.pantalla}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <TouchableOpacity
        style={styles.botonCerrar}
        onPress={() => navigation.goBack()}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="close" size={28} color={colores.blanco} />
      </TouchableOpacity>

      <View style={styles.contenedorImagen}>
        {uri ? (
          <Image source={{ uri }} style={styles.imagen} resizeMode="contain" />
        ) : (
          <Text style={styles.textoVacio}>No se encontró la imagen.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: "#000000",
  },
  botonCerrar: {
    position: "absolute",
    top: 44,
    right: 18,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
  },
  contenedorImagen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 40,
  },
  imagen: {
    width: "100%",
    height: "100%",
  },
  textoVacio: {
    color: colores.blanco,
    textAlign: "center",
    padding: 20,
  },
});
