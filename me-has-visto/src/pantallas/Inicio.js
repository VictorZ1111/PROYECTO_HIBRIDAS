import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import Boton from "../componentes/Boton";
import TarjetaReporte from "../componentes/TarjetaReporte";
import { colores } from "../estilos/colores";

export default function Inicio({ navigation, reportes, actualizarReportes }) {
  const actualizar = async () => {
    const nuevosReportes = reportes.map((reporte) => ({
      ...reporte,
      sincronizado: true,
    }));

    await actualizarReportes(nuevosReportes);
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>¿ME HAS VISTO?</Text>

      <Text style={styles.subtitulo}>
        Reportes recientes de mascotas perdidas y encontradas.
      </Text>

      <Boton
        texto="Reportar mascota"
        onPress={() => navigation.navigate("CrearReporte")}
      />

      <Boton
        texto="Mis reportes"
        tipo="secundario"
        onPress={() => navigation.navigate("MisReportes")}
      />

      <Boton
        texto="Actualizar reportes"
        tipo="secundario"
        onPress={actualizar}
      />

      <FlatList
        data={reportes}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TarjetaReporte
            reporte={item}
            onPress={() =>
              navigation.navigate("DetalleReporte", { reporte: item })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
    padding: 16,
  },
  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    color: colores.principalOscuro,
    textAlign: "center",
  },
  subtitulo: {
    color: colores.gris,
    textAlign: "center",
    marginBottom: 14,
  },
});