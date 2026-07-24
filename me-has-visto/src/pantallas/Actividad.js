import React, { useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BotonFlotante from "../componentes/BotonFlotante";
import Boton from "../componentes/Boton";
import { colores } from "../estilos/colores";

const SECCIONES = [
  { id: "avisos", titulo: "Avisos", icono: "shield-alert-outline" },
  { id: "avistamientos", titulo: "Avistamientos", icono: "eye-check-outline" },
  { id: "reportes", titulo: "Reportes", icono: "file-search-outline" },
];

function obtenerTiempo(item) {
  return new Date(item?.creadoEn || item?.fechaMotivoAdmin || item?.fecha || 0).getTime();
}

function ordenarPorFecha(lista) {
  return [...lista].sort((a, b) => obtenerTiempo(b) - obtenerTiempo(a));
}

function esUsuarioReporte(reporte, usuario) {
  return reporte?.usuarioId && usuario?.id
    ? String(reporte.usuarioId) === String(usuario.id)
    : reporte?.propio;
}

function esUsuarioAvistamiento(avistamiento, usuario) {
  return avistamiento?.usuarioId && usuario?.id
    ? String(avistamiento.usuarioId) === String(usuario.id)
    : false;
}

function agruparAvistamientosEnviados(reportes, usuario) {
  return reportes
    .map((reporte) => {
      const avistamientos = ordenarPorFecha(
        (reporte.avistamientos || [])
          .filter((avistamiento) => esUsuarioAvistamiento(avistamiento, usuario))
          .map((avistamiento) => ({
            ...avistamiento,
            tipo: "avistamiento_enviado",
            reporteId: reporte.id,
            nombreMascota: reporte.nombreMascota,
            imagenMascota: reporte.imagen,
            ciudad: reporte.ciudad,
            sector: reporte.sector,
            reporteCompleto: reporte,
          }))
      );

      if (avistamientos.length === 0) return null;

      const ultimoAvistamiento = avistamientos[0];

      return {
        id: `reporte-enviado-${reporte.id}`,
        tipo: "reporte_avistamientos_enviados",
        reporteId: reporte.id,
        nombreMascota: reporte.nombreMascota,
        imagenMascota: reporte.imagen,
        ciudad: reporte.ciudad,
        sector: reporte.sector,
        fecha: ultimoAvistamiento.fecha,
        creadoEn: ultimoAvistamiento.creadoEn || ultimoAvistamiento.fecha,
        reporteCompleto: reporte,
        avistamientos,
      };
    })
    .filter(Boolean);
}

export default function Actividad({ navigation, reportes, usuario }) {
  const [seccionActiva, setSeccionActiva] = useState("avisos");
  const [reportesAbiertos, setReportesAbiertos] = useState({});

  const datos = useMemo(() => {
    const avisos = reportes
      .filter((reporte) => esUsuarioReporte(reporte, usuario) && reporte.motivoAdmin)
      .map((reporte) => ({
        id: `aviso-admin-${reporte.id}`,
        tipo: "aviso",
        reporteId: reporte.id,
        nombreMascota: reporte.nombreMascota,
        imagenMascota: reporte.imagen,
        ciudad: reporte.ciudad,
        sector: reporte.sector,
        fecha: reporte.fechaMotivoAdmin
          ? new Date(reporte.fechaMotivoAdmin).toLocaleDateString("es-EC")
          : reporte.fecha,
        creadoEn: reporte.fechaMotivoAdmin || reporte.actualizadoEn || reporte.creadoEn,
        observacion: reporte.motivoAdmin,
        reporteCompleto: reporte,
        avistamientos: reporte.avistamientos || [],
      }));

    const avistamientosRecibidos = reportes.flatMap((reporte) => {
      if (!esUsuarioReporte(reporte, usuario)) return [];

      return (reporte.avistamientos || [])
        .filter((avistamiento) => !esUsuarioAvistamiento(avistamiento, usuario))
        .map((avistamiento) => ({
          ...avistamiento,
          id: `recibido-${reporte.id}-${avistamiento.id}`,
          tipo: "avistamiento_recibido",
          reporteId: reporte.id,
          nombreMascota: reporte.nombreMascota,
          imagenMascota: reporte.imagen,
          ciudad: reporte.ciudad,
          sector: reporte.sector,
          reporteCompleto: reporte,
        }));
    });

    const reportesConAvistamientosEnviados = agruparAvistamientosEnviados(reportes, usuario);

    return {
      avisos: ordenarPorFecha(avisos),
      avistamientos: ordenarPorFecha(avistamientosRecibidos),
      reportes: ordenarPorFecha(reportesConAvistamientosEnviados),
    };
  }, [reportes, usuario]);

  const actividad = datos[seccionActiva] || [];

  const obtenerTitulo = (item) => {
    if (item.tipo === "aviso") return "Aviso del administrador";
    if (item.tipo === "avistamiento_recibido") return "Avistamiento recibido";
    if (item.tipo === "reporte_avistamientos_enviados") return "Reporte avistado";
    return "Avistamiento enviado";
  };

  const obtenerIcono = (item) => {
    if (item.tipo === "aviso") return "shield-alert-outline";
    if (item.tipo === "avistamiento_recibido") return "eye-check-outline";
    if (item.tipo === "reporte_avistamientos_enviados") return "file-map-outline";
    return "map-marker-check-outline";
  };

  const textoVacio = {
    avisos: "No tienes avisos del administrador.",
    avistamientos: "Aún no recibes avistamientos en tus reportes.",
    reportes: "Aún no has enviado avistamientos a otros reportes.",
  }[seccionActiva];

  const abrirDetalleAvistamientos = (item, avistamientosPersonalizados = null) => {
    if (!item.reporteCompleto) return;

    navigation.navigate("DetalleAvistamientos", {
      reporte: item.reporteCompleto,
      avistamientos: avistamientosPersonalizados || (item.tipo === "aviso" ? item.avistamientos : [item]),
    });
  };

  const abrirImagen = (uri, titulo = "Imagen") => {
    if (!uri) return;
    navigation.navigate("VistaImagen", { uri, titulo });
  };

  const alternarReporte = (id) => {
    setReportesAbiertos((actual) => ({
      ...actual,
      [id]: !actual[id],
    }));
  };

  const renderReporteConAvistamientos = (item) => {
    const abierto = !!reportesAbiertos[item.id];

    return (
      <View style={styles.tarjeta}>
        <View style={[styles.iconoCardSuperior, item.tipo === "aviso" && styles.iconoAviso]}>
          <MaterialCommunityIcons name={obtenerIcono(item)} size={23} color={colores.blanco} />
        </View>

        <View style={styles.fila}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => abrirImagen(item.imagenMascota, item.nombreMascota)}>
            <Image source={{ uri: item.imagenMascota }} style={styles.imagen} />
          </TouchableOpacity>

          <View style={styles.info}>
            <Text style={styles.tituloActividad}>{obtenerTitulo(item)}</Text>
            <Text style={styles.nombre} numberOfLines={1}>{item.nombreMascota}</Text>
            <Text style={styles.ubicacion}>{item.ciudad}, {item.sector}</Text>
            <Text style={styles.fecha}>{item.fecha}</Text>
          </View>
        </View>

        <View style={styles.accionesReporte}>
          <Boton
            texto="Ver reporte"
            tipo="secundario"
            onPress={() => navigation.navigate("DetalleReporte", { reporte: item.reporteCompleto })}
          />
        </View>

        <TouchableOpacity
          style={styles.encabezadoDesplegable}
          onPress={() => alternarReporte(item.id)}
          activeOpacity={0.85}
        >
          <Text style={styles.tituloDesplegable}>Avistamientos registrados</Text>
          <MaterialCommunityIcons
            name={abierto ? "chevron-up" : "chevron-down"}
            size={24}
            color={colores.principalOscuro}
          />
        </TouchableOpacity>

        {abierto ? (
          <View style={styles.listaAvistamientosInterna}>
            {item.avistamientos.map((avistamiento, index) => (
              <View key={avistamiento.id || index} style={styles.filaAvistamientoInterno}>
                <View style={styles.infoAvistamientoInterno}>
                  <Text style={styles.fechaAvistamientoInterno}>{avistamiento.fecha || "Fecha no registrada"}</Text>
                  <Text style={styles.textoAvistamientoInterno} numberOfLines={2}>
                    {avistamiento.observacion || "Sin observación"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.botonVerPequeno}
                  onPress={() => abrirDetalleAvistamientos(item, [avistamiento])}
                  activeOpacity={0.85}
                >
                  <Text style={styles.textoBotonVer}>Ver</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    );
  };

  const renderActividadNormal = (item) => (
    <View style={[styles.tarjeta, item.tipo === "aviso" && styles.tarjetaAviso]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          item.reporteCompleto
            ? navigation.navigate("DetalleReporte", { reporte: item.reporteCompleto })
            : null
        }
      >
        <View style={[styles.iconoCardSuperior, item.tipo === "aviso" && styles.iconoAviso]}>
          <MaterialCommunityIcons name={obtenerIcono(item)} size={23} color={colores.blanco} />
        </View>

        <View style={styles.fila}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => abrirImagen(item.imagenMascota, item.nombreMascota)}>
            <Image source={{ uri: item.imagenMascota }} style={styles.imagen} />
          </TouchableOpacity>

          <View style={styles.info}>
            <Text style={styles.tituloActividad}>{obtenerTitulo(item)}</Text>
            <Text style={styles.nombre} numberOfLines={1}>{item.nombreMascota}</Text>
            <Text style={styles.ubicacion}>{item.ciudad}, {item.sector}</Text>
            <Text style={styles.fecha}>{item.fecha}</Text>
          </View>
        </View>

        <View style={[styles.cajaObservacion, item.tipo === "aviso" && styles.cajaAdmin]}>
          <Text style={styles.observacion}>{item.observacion}</Text>
        </View>
      </TouchableOpacity>

      {(item.tipo === "aviso" && item.avistamientos.length > 0) || item.tipo !== "aviso" ? (
        <View style={styles.acciones}>
          <Boton
            texto="Ver"
            tipo="secundario"
            onPress={() => abrirDetalleAvistamientos(item)}
          />
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.pantalla}>
      <View style={styles.contenedor}>
        <View style={styles.selectorSecciones}>
          {SECCIONES.map((seccion) => (
            <TouchableOpacity
              key={seccion.id}
              style={[
                styles.botonSeccion,
                seccionActiva === seccion.id && styles.botonSeccionActivo,
              ]}
              onPress={() => setSeccionActiva(seccion.id)}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name={seccion.icono}
                size={20}
                color={seccionActiva === seccion.id ? colores.blanco : colores.gris}
              />
              <Text
                style={[
                  styles.textoSeccion,
                  seccionActiva === seccion.id && styles.textoSeccionActivo,
                ]}
              >
                {seccion.titulo}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {actividad.length === 0 ? (
          <View style={styles.vacio}>
            <Text style={styles.textoVacio}>{textoVacio}</Text>
          </View>
        ) : (
          <FlatList
            data={actividad}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.lista}
            renderItem={({ item }) =>
              item.tipo === "reporte_avistamientos_enviados"
                ? renderReporteConAvistamientos(item)
                : renderActividadNormal(item)
            }
          />
        )}
      </View>

      <BotonFlotante onPress={() => navigation.navigate("CrearReporte")} />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondo,
    padding: 14,
  },
  selectorSecciones: {
    flexDirection: "row",
    backgroundColor: colores.blanco,
    borderRadius: 18,
    padding: 5,
    borderWidth: 1,
    borderColor: colores.borde,
    gap: 5,
    marginBottom: 12,
  },
  botonSeccion: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 6,
    gap: 2,
  },
  botonSeccionActivo: {
    backgroundColor: colores.principalOscuro,
  },
  textoSeccion: {
    color: colores.gris,
    fontWeight: "bold",
    fontSize: 11,
    textAlign: "center",
  },
  textoSeccionActivo: {
    color: colores.blanco,
  },
  lista: {
    paddingBottom: 112,
  },
  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 12,
    position: "relative",
  },
  iconoCardSuperior: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colores.principalOscuro,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  tarjetaAviso: {
    borderColor: colores.principalOscuro,
    backgroundColor: "#FFF8F3",
  },
  iconoAviso: {
    backgroundColor: colores.rojo,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 42,
  },
  imagen: {
    width: 72,
    height: 72,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: colores.grisClaro,
  },
  info: {
    flex: 1,
  },
  tituloActividad: {
    color: colores.texto,
    fontWeight: "bold",
    fontSize: 14,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: colores.texto,
    marginTop: 1,
  },
  ubicacion: {
    color: colores.gris,
    marginTop: 3,
  },
  fecha: {
    color: colores.gris,
    fontSize: 12,
    marginTop: 3,
  },
  cajaObservacion: {
    backgroundColor: colores.verdeClaro,
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  cajaAdmin: {
    backgroundColor: colores.naranjaClaro,
    borderWidth: 1,
    borderColor: "rgba(231,111,81,0.22)",
  },
  observacion: {
    color: colores.texto,
    lineHeight: 19,
  },
  acciones: {
    marginTop: 10,
  },
  accionesReporte: {
    marginTop: 12,
  },
  encabezadoDesplegable: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.fondo,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tituloDesplegable: {
    color: colores.texto,
    fontWeight: "bold",
    fontSize: 15,
  },
  listaAvistamientosInterna: {
    marginTop: 8,
    gap: 8,
  },
  filaAvistamientoInterno: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: colores.verdeClaro,
    padding: 10,
    gap: 10,
  },
  infoAvistamientoInterno: {
    flex: 1,
  },
  fechaAvistamientoInterno: {
    color: colores.texto,
    fontWeight: "bold",
    fontSize: 12,
  },
  textoAvistamientoInterno: {
    color: colores.gris,
    marginTop: 3,
    lineHeight: 18,
  },
  botonVerPequeno: {
    backgroundColor: colores.principalOscuro,
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  textoBotonVer: {
    color: colores.blanco,
    fontWeight: "bold",
  },
  vacio: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 80,
  },
  textoVacio: {
    color: colores.gris,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 21,
  },
});
