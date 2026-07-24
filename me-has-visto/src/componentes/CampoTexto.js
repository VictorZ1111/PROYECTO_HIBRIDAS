import React, { useState } from "react";
import { TextInput, StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colores } from "../estilos/colores";

export default function CampoTexto({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  multiline = false,
  keyboardType = "default",
  editable = true,
  ...props
}) {
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const esCampoContrasena = secureTextEntry && !multiline;

  const alternarVisibilidad = () => {
    setMostrarContrasena((valorActual) => !valorActual);
  };

  return (
    <View style={styles.contenedorCampo}>
      <TextInput
        style={[
          styles.input,
          esCampoContrasena && styles.inputConIcono,
          multiline && styles.multilinea,
          !editable && styles.bloqueado,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colores.gris}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={esCampoContrasena ? !mostrarContrasena : secureTextEntry}
        multiline={multiline}
        keyboardType={keyboardType}
        editable={editable}
        autoCorrect={esCampoContrasena ? false : props.autoCorrect}
        {...props}
      />

      {esCampoContrasena && editable && (
        <TouchableOpacity
          style={styles.botonOjo}
          onPress={alternarVisibilidad}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          <Ionicons
            name={mostrarContrasena ? "eye-off-outline" : "eye-outline"}
            size={22}
            color={colores.gris}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorCampo: {
    position: "relative",
  },
  input: {
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 12,
    padding: 13,
    marginVertical: 7,
    fontSize: 15,
    color: colores.texto,
  },
  inputConIcono: {
    paddingRight: 48,
  },
  botonOjo: {
    position: "absolute",
    right: 12,
    top: 7,
    bottom: 7,
    width: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  bloqueado: {
    backgroundColor: colores.grisClaro,
    color: colores.gris,
  },
  multilinea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
});
