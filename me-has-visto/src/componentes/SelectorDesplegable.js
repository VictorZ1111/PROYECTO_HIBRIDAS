import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colores } from "../estilos/colores";

export default function SelectorDesplegable({
  etiqueta,
  valor,
  opciones = [],
  placeholder = "Seleccionar",
  onChange,
  deshabilitado = false,
}) {
  const [abierto, setAbierto] = useState(false);
  const valorVisible = valor || placeholder;

  const opcionesUnicas = useMemo(() => {
    return [...new Set(opciones.filter(Boolean))];
  }, [opciones]);

  const cerrar = () => setAbierto(false);

  const seleccionar = (opcion) => {
    cerrar();
    onChange?.(opcion);
  };

  const renderOpcion = ({ item }) => (
    <TouchableOpacity
      style={[styles.opcion, item === valor && styles.opcionActiva]}
      onPress={() => seleccionar(item)}
      activeOpacity={0.85}
    >
      <Text style={[styles.textoOpcion, item === valor && styles.textoOpcionActiva]}>{item}</Text>
      {item === valor ? (
        <MaterialCommunityIcons name="check-circle" size={21} color={colores.secundario} />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.contenedor}>
      {etiqueta ? <Text style={styles.etiqueta}>{etiqueta}</Text> : null}

      <TouchableOpacity
        style={[styles.selector, deshabilitado && styles.selectorDeshabilitado]}
        onPress={() => !deshabilitado && setAbierto(true)}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.valor,
            !valor && styles.placeholder,
            deshabilitado && styles.textoDeshabilitado,
          ]}
          numberOfLines={1}
        >
          {valorVisible}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={24}
          color={deshabilitado ? colores.gris : colores.texto}
        />
      </TouchableOpacity>

      <Modal visible={abierto && !deshabilitado} transparent animationType="fade" onRequestClose={cerrar}>
        <View style={styles.modalFondo}>
          <Pressable style={styles.cerrarFondo} onPress={cerrar} />

          <View style={styles.listaCaja}>
            <View style={styles.listaCabecera}>
              <Text style={styles.listaTitulo}>{etiqueta || placeholder}</Text>
              <TouchableOpacity onPress={cerrar} style={styles.botonCerrar} activeOpacity={0.85}>
                <MaterialCommunityIcons name="close" size={22} color={colores.texto} />
              </TouchableOpacity>
            </View>

            {opcionesUnicas.length === 0 ? (
              <Text style={styles.sinOpciones}>Sin opciones disponibles</Text>
            ) : (
              <FlatList
                data={opcionesUnicas}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={renderOpcion}
                style={styles.lista}
                contentContainerStyle={styles.listaContenido}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
                initialNumToRender={18}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    marginBottom: 10,
  },
  etiqueta: {
    color: colores.texto,
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 13,
  },
  selector: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 13,
    backgroundColor: colores.blanco,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorDeshabilitado: {
    backgroundColor: colores.grisClaro,
  },
  valor: {
    flex: 1,
    color: colores.texto,
    fontSize: 15,
    marginRight: 8,
  },
  placeholder: {
    color: colores.gris,
  },
  textoDeshabilitado: {
    color: colores.gris,
  },
  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.28)",
    justifyContent: "center",
    padding: 22,
  },
  cerrarFondo: {
    ...StyleSheet.absoluteFillObject,
  },
  listaCaja: {
    backgroundColor: colores.blanco,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colores.borde,
    overflow: "hidden",
    maxHeight: "76%",
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  listaCabecera: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: colores.fondo,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  listaTitulo: {
    flex: 1,
    color: colores.texto,
    fontWeight: "bold",
    fontSize: 17,
  },
  botonCerrar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colores.blanco,
    justifyContent: "center",
    alignItems: "center",
  },
  lista: {
    maxHeight: 430,
  },
  listaContenido: {
    paddingVertical: 6,
  },
  opcion: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colores.grisClaro,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  opcionActiva: {
    backgroundColor: colores.verdeClaro,
  },
  textoOpcion: {
    color: colores.texto,
    fontSize: 15,
    flex: 1,
  },
  textoOpcionActiva: {
    color: colores.secundario,
    fontWeight: "bold",
  },
  sinOpciones: {
    padding: 18,
    color: colores.gris,
    textAlign: "center",
  },
});
