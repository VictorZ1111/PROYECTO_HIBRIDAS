import React, { useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import AlertaBonita from "../componentes/AlertaBonita";
import { colores } from "../estilos/colores";

export default function Chat({ route, navigation, registrarContactoReporte, usuario }) {
  const reporte = route.params?.reporte;
  const [alerta, setAlerta] = useState(null);
  const esAdmin = usuario?.rol === "admin";
  const esPropio =
    reporte?.usuarioId && usuario?.id
      ? String(reporte.usuarioId) === String(usuario.id)
      : reporte?.propio;
  const disponible = (reporte?.estadoReporte || "activo") === "activo" && reporte?.estado !== "Encontrada";
  const puedeContactar = !esAdmin && !esPropio && disponible;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: reporte?.nombreMascota || "Contacto",
      headerRight: () => (
        <TouchableOpacity
          style={styles.botonReporteHeader}
          onPress={() => navigation.navigate("DetalleReporte", { reporte })}
          activeOpacity={0.85}
        >
          <Text style={styles.patitaHeader}>🐾</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, reporte]);

  const cerrarAlerta = () => setAlerta(null);

  const mostrarAlerta = (titulo, mensaje, tipo = "info") => {
    setAlerta({ titulo, mensaje, tipo });
  };

  const telefonoLimpio = (reporte?.telefono || "").replace(/\D/g, "");
  const telefonoWhatsapp = telefonoLimpio.startsWith("0")
    ? `593${telefonoLimpio.substring(1)}`
    : telefonoLimpio;

  const validarContacto = () => {
    if (!puedeContactar) {
      mostrarAlerta(
        "Contacto no disponible",
        "Esta acción no está disponible para este reporte.",
        "advertencia"
      );
      return false;
    }

    if (!telefonoLimpio) {
      mostrarAlerta("Sin teléfono", "Este reporte no tiene número registrado.", "advertencia");
      return false;
    }

    return true;
  };

  const abrirWhatsapp = async () => {
    if (!validarContacto()) {
      return;
    }

    if (registrarContactoReporte) {
      await registrarContactoReporte(reporte, "whatsapp");
    }

    const mensaje = `Hola, vi el reporte de ${reporte.nombreMascota} en ¿ME HAS VISTO?`;
    const url = `https://wa.me/${telefonoWhatsapp}?text=${encodeURIComponent(mensaje)}`;

    Linking.openURL(url).catch(() => {
      mostrarAlerta(
        "No se pudo abrir WhatsApp",
        "Verifica que la aplicación esté instalada o intenta llamar directamente.",
        "error"
      );
    });
  };

  const llamarContacto = async () => {
    if (!validarContacto()) {
      return;
    }

    if (registrarContactoReporte) {
      await registrarContactoReporte(reporte, "llamada");
    }

    Linking.openURL(`tel:${telefonoLimpio}`).catch(() => {
      mostrarAlerta("No se pudo llamar", "El dispositivo no pudo iniciar la llamada.", "error");
    });
  };

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.banner}>
        <View style={styles.avatar}>
          {reporte?.usuarioFoto ? (
            <Image source={{ uri: reporte.usuarioFoto }} style={styles.foto} />
          ) : (
            <Text style={styles.avatarTexto}>
              {reporte?.usuarioNombre ? reporte.usuarioNombre.charAt(0).toUpperCase() : "U"}
            </Text>
          )}
        </View>

        <View style={styles.infoUsuario}>
          <Text style={styles.nombreUsuario}>{reporte?.usuarioNombre || "Usuario del reporte"}</Text>
          <Text style={styles.subtitulo}>Persona que publicó este reporte</Text>
          <Text style={styles.mascota}>Reporte de {reporte?.nombreMascota || "mascota"}</Text>
        </View>
      </View>

      <View style={styles.caja}>
        <Text style={styles.tituloCaja}>Datos de contacto</Text>

        <View style={styles.filaDato}>
          <Ionicons name="call-outline" size={20} color={colores.gris} />
          <Text style={styles.textoDato}>{reporte?.telefono || "No registrado"}</Text>
        </View>
      </View>

      <View style={styles.acciones}>
        <TouchableOpacity
          style={[styles.botonAccion, !puedeContactar && styles.botonDeshabilitado]}
          onPress={abrirWhatsapp}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="whatsapp" size={34} color={colores.blanco} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botonAccion, styles.botonLlamar, !puedeContactar && styles.botonDeshabilitado]}
          onPress={llamarContacto}
          activeOpacity={0.85}
        >
          <Ionicons name="call" size={32} color={colores.blanco} />
        </TouchableOpacity>
      </View>

      {!puedeContactar && (
        <Text style={styles.nota}>
          Las acciones de contacto no están disponibles en reportes propios, administrativos, bloqueados o encontrados.
        </Text>
      )}

      <AlertaBonita
        visible={!!alerta}
        tipo={alerta?.tipo}
        titulo={alerta?.titulo}
        mensaje={alerta?.mensaje}
        onCerrar={cerrarAlerta}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: 16,
    paddingBottom: 120,
  },
  botonReporteHeader: {
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.borde,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  patitaHeader: {
    fontSize: 20,
  },
  banner: {
    backgroundColor: colores.blanco,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: colores.principal,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: 14,
  },
  foto: {
    width: "100%",
    height: "100%",
  },
  avatarTexto: {
    fontSize: 34,
    fontWeight: "bold",
    color: colores.blanco,
  },
  infoUsuario: {
    flex: 1,
  },
  nombreUsuario: {
    fontSize: 20,
    fontWeight: "bold",
    color: colores.texto,
  },
  subtitulo: {
    color: colores.gris,
    marginTop: 3,
    fontSize: 13,
  },
  mascota: {
    color: colores.principalOscuro,
    fontWeight: "bold",
    marginTop: 8,
  },
  caja: {
    backgroundColor: colores.blanco,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 16,
  },
  tituloCaja: {
    fontSize: 17,
    fontWeight: "bold",
    color: colores.texto,
    marginBottom: 12,
  },
  filaDato: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
  },
  textoDato: {
    color: colores.gris,
    marginLeft: 10,
    flex: 1,
  },
  acciones: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 4,
  },
  botonAccion: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#25D366",
    justifyContent: "center",
    alignItems: "center",
    elevation: 7,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  botonLlamar: {
    backgroundColor: colores.secundario,
  },
  botonDeshabilitado: {
    backgroundColor: colores.gris,
  },
  nota: {
    color: colores.gris,
    textAlign: "center",
    marginTop: 18,
    lineHeight: 20,
    fontSize: 13,
  },
});
