import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colores } from "../estilos/colores";

function obtenerEtiquetaInterna(estadoInterno) {
  if (estadoInterno === "eliminado_admin") {
    return "Eliminado por admin";
  }

  if (estadoInterno === "resuelto") {
    return "Resuelto";
  }

  return estadoInterno;
}

export default function TarjetaReporte({ reporte, onPress }) {
  const esEncontrada = reporte.estado === "Encontrada";
  const estadoInterno = reporte.estadoReporte || "activo";

  return (
    <TouchableOpacity style={styles.tarjeta} onPress={onPress} activeOpacity={0.85}>
      <Image
        source={{
          uri:
            reporte.imagen ||
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=900",
        }}
        style={styles.imagen}
      />

      <View style={styles.info}>
        <View style={styles.fila}>
          <Text style={styles.nombre} numberOfLines={1}>
            {reporte.nombreMascota}
          </Text>

          <Text style={[styles.estado, esEncontrada && styles.estadoEncontrada]}>
            {reporte.estado}
          </Text>
        </View>

        <Text style={styles.detalle} numberOfLines={1}>
          {reporte.tipoMascota} · {reporte.color}
        </Text>

        <Text style={styles.ubicacion} numberOfLines={1}>
          {reporte.provincia ? `${reporte.provincia} · ` : ""}
          {reporte.ciudad}, {reporte.sector}
        </Text>

        <Text style={styles.fecha}>{reporte.fecha}</Text>

        {estadoInterno !== "activo" && (
          <Text style={styles.estadoInterno}>{obtenerEtiquetaInterna(estadoInterno)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: "row",
    backgroundColor: colores.blanco,
    borderRadius: 16,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  imagen: {
    width: 92,
    height: 92,
    borderRadius: 14,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  nombre: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: colores.texto,
  },
  estado: {
    backgroundColor: colores.naranjaClaro,
    color: colores.principalOscuro,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    fontWeight: "bold",
  },
  estadoEncontrada: {
    backgroundColor: colores.verdeClaro,
    color: colores.secundario,
  },
  detalle: {
    color: colores.gris,
    marginTop: 4,
  },
  ubicacion: {
    color: colores.texto,
    marginTop: 4,
  },
  fecha: {
    color: colores.gris,
    fontSize: 12,
    marginTop: 4,
  },
  estadoInterno: {
    marginTop: 4,
    color: colores.principalOscuro,
    fontSize: 12,
    fontWeight: "bold",
  },
});
