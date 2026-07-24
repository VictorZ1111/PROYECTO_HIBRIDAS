import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BotonFlotante from "../componentes/BotonFlotante";
import SelectorDesplegable from "../componentes/SelectorDesplegable";
import { colores } from "../estilos/colores";
import {
  PROVINCIAS_ECUADOR,
  obtenerCiudadesPorProvincia,
  normalizarUbicacion,
} from "../utilidades/ubicacionesEcuador";

const MAX_MARCADORES = 7;
const MAX_POR_PROVINCIA = 1;

const POSICIONES_PROVINCIA = {
  Carchi: { top: "18%", left: "43%" },
  Imbabura: { top: "24%", left: "42%" },
  Pichincha: { top: "31%", left: "45%" },
  "Santo Domingo de los Tsáchilas": { top: "37%", left: "37%" },
  Esmeraldas: { top: "23%", left: "28%" },
  Manabí: { top: "47%", left: "30%" },
  "Santa Elena": { top: "65%", left: "30%" },
  Guayas: { top: "61%", left: "37%" },
  "Los Ríos": { top: "51%", left: "40%" },
  "El Oro": { top: "78%", left: "42%" },
  Azuay: { top: "70%", left: "48%" },
  Cañar: { top: "62%", left: "49%" },
  Loja: { top: "82%", left: "49%" },
  Bolívar: { top: "51%", left: "48%" },
  Cotopaxi: { top: "40%", left: "48%" },
  Tungurahua: { top: "47%", left: "53%" },
  Chimborazo: { top: "55%", left: "52%" },
  Sucumbíos: { top: "23%", left: "65%" },
  Napo: { top: "38%", left: "63%" },
  Orellana: { top: "36%", left: "73%" },
  Pastaza: { top: "52%", left: "68%" },
  "Morona Santiago": { top: "65%", left: "62%" },
  "Zamora Chinchipe": { top: "82%", left: "59%" },
  Galápagos: { top: "81%", left: "17%" },
};

const AJUSTES_MARCADOR = [
  { x: 0, y: 0 },
  { x: 3, y: -4 },
  { x: -4, y: 3 },
  { x: 5, y: 4 },
  { x: -5, y: -3 },
  { x: 2, y: 5 },
  { x: -3, y: 5 },
];

function convertirPorcentaje(valor, ajuste) {
  const numero = Number(String(valor).replace("%", ""));
  return `${Math.max(6, Math.min(90, numero + ajuste))}%`;
}

function obtenerClaveDia() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`;
}

function hashTexto(texto = "") {
  return String(texto)
    .split("")
    .reduce((total, letra) => total + letra.charCodeAt(0), 0);
}

function ordenarAleatorioEstable(lista, semilla) {
  return [...lista].sort((a, b) => {
    const valorA = hashTexto(`${a.provincia}-${a.id}-${semilla}`) % 1000;
    const valorB = hashTexto(`${b.provincia}-${b.id}-${semilla}`) % 1000;
    return valorA - valorB;
  });
}

function ordenarPorFecha(lista) {
  return [...lista].sort((a, b) => {
    const fechaA = new Date(a.creadoEn || a.actualizadoEn || 0).getTime();
    const fechaB = new Date(b.creadoEn || b.actualizadoEn || 0).getTime();
    return fechaB - fechaA;
  });
}

function seleccionarReportesParaMapa(reportes, semilla) {
  const grupos = reportes.reduce((acumulador, reporte) => {
    const provincia = reporte.provincia || "Sin provincia";

    if (!acumulador[provincia]) {
      acumulador[provincia] = [];
    }

    acumulador[provincia].push(reporte);
    return acumulador;
  }, {});

  const provinciasOrdenadas = ordenarAleatorioEstable(
    Object.keys(grupos).map((provincia) => ({ provincia, id: provincia })),
    semilla
  ).map((item) => item.provincia);

  const seleccionados = [];

  provinciasOrdenadas.forEach((provincia) => {
    if (seleccionados.length >= MAX_MARCADORES) {
      return;
    }

    const reportesProvincia = ordenarAleatorioEstable(
      ordenarPorFecha(grupos[provincia]),
      semilla
    ).slice(0, MAX_POR_PROVINCIA);

    reportesProvincia.forEach((reporte) => {
      if (seleccionados.length < MAX_MARCADORES) {
        seleccionados.push(reporte);
      }
    });
  });

  return seleccionados;
}

function obtenerPosicionReporte(reporte, index) {
  const base = POSICIONES_PROVINCIA[reporte.provincia] || {
    top: "45%",
    left: "45%",
  };
  const ajuste = AJUSTES_MARCADOR[index % AJUSTES_MARCADOR.length];

  return {
    top: convertirPorcentaje(base.top, ajuste.y),
    left: convertirPorcentaje(base.left, ajuste.x),
  };
}

function MarcadorPatita({ style, onPress }) {
  return (
    <TouchableOpacity style={[styles.marcador, style]} onPress={onPress} activeOpacity={0.9}>
      <MaterialCommunityIcons name="map-marker" size={50} color={colores.principalOscuro} />
      <View style={styles.patitaInterna}>
        <MaterialCommunityIcons name="paw" size={19} color={colores.blanco} />
      </View>
    </TouchableOpacity>
  );
}

export default function MapaReportes({
  navigation,
  reportes,
  recargarReportes,
  usuario,
  modoAdmin = false,
}) {
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("Todos");
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("Todos");
  const [actualizando, setActualizando] = useState(false);

  const esAdmin = modoAdmin || usuario?.rol === "admin";

  const ciudades = useMemo(() => {
    if (provinciaSeleccionada === "Todos") {
      return ["Todos"];
    }

    return ["Todos", ...obtenerCiudadesPorProvincia(provinciaSeleccionada)];
  }, [provinciaSeleccionada]);

  const reportesDisponibles = useMemo(() => {
    return reportes.filter((reporte) => {
      const estadoReporte = reporte.estadoReporte || "activo";
      const reporteActivo = estadoReporte === "activo";
      const mascotaPendiente = reporte.estado !== "Encontrada";
      const cumpleProvincia =
        provinciaSeleccionada === "Todos" ||
        normalizarUbicacion(reporte.provincia) === normalizarUbicacion(provinciaSeleccionada);
      const cumpleCiudad =
        ciudadSeleccionada === "Todos" ||
        normalizarUbicacion(reporte.ciudad) === normalizarUbicacion(ciudadSeleccionada);

      return reporteActivo && mascotaPendiente && cumpleProvincia && cumpleCiudad;
    });
  }, [reportes, provinciaSeleccionada, ciudadSeleccionada]);

  const reportesMapa = useMemo(() => {
    const semilla = `${obtenerClaveDia()}-${provinciaSeleccionada}-${ciudadSeleccionada}-${reportesDisponibles.length}`;
    return seleccionarReportesParaMapa(reportesDisponibles, semilla);
  }, [reportesDisponibles, provinciaSeleccionada, ciudadSeleccionada]);

  const limpiarFiltros = () => {
    setProvinciaSeleccionada("Todos");
    setCiudadSeleccionada("Todos");
  };

  const actualizarMapa = async () => {
    setActualizando(true);

    try {
      if (recargarReportes) {
        await recargarReportes();
      }

    } finally {
      setActualizando(false);
    }
  };

  return (
    <View style={styles.pantalla}>
      <ScrollView
        style={styles.contenedor}
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={esAdmin ? styles.cabeceraAdmin : styles.sloganCaja}>
          <View style={styles.filaTitulo}>
            <View style={esAdmin ? styles.iconoCabeceraAdmin : styles.iconoTitulo}>
              <MaterialCommunityIcons
                name={esAdmin ? "map-search-outline" : "paw"}
                size={esAdmin ? 28 : 22}
                color={colores.blanco}
              />
            </View>
            <View style={styles.infoTitulo}>
              <Text style={esAdmin ? styles.tituloAdmin : styles.sloganTitulo}>
                {esAdmin ? "Mapa de reportes" : "¡AYÚDALOS A REENCONTRARSE!"}
              </Text>
              <Text style={esAdmin ? styles.descripcionAdmin : styles.sloganTexto}>
                {esAdmin
                  ? "Visualiza los reportes activos por provincia y ciudad."
                  : "Avista una mascota y repórtala para ayudar a reencontrarse con los suyos."}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cajaFiltros}>
          <View style={styles.filaEntre}>
            <Text style={styles.subtitulo}>Filtros</Text>
            <TouchableOpacity style={styles.botonLimpiar} onPress={limpiarFiltros} activeOpacity={0.85}>
              <MaterialCommunityIcons name="broom" size={22} color={colores.principalOscuro} />
            </TouchableOpacity>
          </View>

          <View style={styles.filaFiltros}>
            <View style={styles.filtroMitad}>
              <SelectorDesplegable
                etiqueta="Provincia"
                valor={provinciaSeleccionada}
                opciones={["Todos", ...PROVINCIAS_ECUADOR]}
                onChange={(valor) => {
                  setProvinciaSeleccionada(valor);
                  setCiudadSeleccionada("Todos");
                }}
              />
            </View>

            <View style={styles.filtroMitad}>
              <SelectorDesplegable
                etiqueta="Ciudad"
                valor={ciudadSeleccionada}
                opciones={ciudades}
                onChange={setCiudadSeleccionada}
                deshabilitado={provinciaSeleccionada === "Todos"}
              />
            </View>
          </View>
        </View>

        <View style={styles.mapaCaja}>
          <View style={styles.filaEntre}>
            <View style={styles.infoMapaTitulo}>
              <Text style={styles.mapaTitulo}>Reportes</Text>
              <Text style={styles.mapaDescripcion}>
                Reportes encontrados
              </Text>
            </View>

            <TouchableOpacity
              style={styles.botonActualizar}
              onPress={actualizarMapa}
              activeOpacity={0.85}
              disabled={actualizando}
            >
              <MaterialCommunityIcons name="refresh" size={21} color={colores.blanco} />
            </TouchableOpacity>
          </View>

          <View style={styles.mapa}>
            <Image
              source={require("../../assets/MAPA.png")}
              style={styles.imagenMapa}
              resizeMode="contain"
            />

            {reportesMapa.map((reporte, index) => {
              const posicion = obtenerPosicionReporte(reporte, index);

              return (
                <MarcadorPatita
                  key={`${reporte.id}-${index}`}
                  style={posicion}
                  onPress={() => navigation.navigate("DetalleReporte", { reporte })}
                />
              );
            })}

            {reportesMapa.length === 0 && (
              <View style={styles.sinReportesMapa}>
                <Text style={styles.sinReportesTexto}>Sin reportes activos en esta zona</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {!esAdmin && <BotonFlotante onPress={() => navigation.navigate("CrearReporte")} />}
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
  },
  contenido: {
    padding: 14,
    paddingBottom: 112,
  },
  sloganCaja: {
    backgroundColor: colores.blanco,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 10,
  },
  cabeceraAdmin: {
    backgroundColor: colores.blanco,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 12,
  },
  filaTitulo: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconoTitulo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colores.principalOscuro,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconoCabeceraAdmin: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colores.principalOscuro,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoTitulo: {
    flex: 1,
  },
  sloganTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: colores.principalOscuro,
    marginBottom: 3,
  },
  sloganTexto: {
    color: colores.gris,
    lineHeight: 20,
    fontSize: 14,
  },
  tituloAdmin: {
    fontSize: 21,
    fontWeight: "bold",
    color: colores.texto,
  },
  descripcionAdmin: {
    color: colores.gris,
    lineHeight: 19,
    marginTop: 4,
    fontSize: 13,
  },
  cajaFiltros: {
    backgroundColor: colores.blanco,
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 10,
    position: "relative",
    zIndex: 50,
    elevation: 50,
  },
  filaEntre: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  subtitulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: colores.texto,
    marginBottom: 8,
  },
  botonLimpiar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colores.naranjaClaro,
    justifyContent: "center",
    alignItems: "center",
  },
  filaFiltros: {
    flexDirection: "row",
    gap: 10,
    position: "relative",
    zIndex: 60,
  },
  filtroMitad: {
    flex: 1,
    position: "relative",
    zIndex: 70,
  },
  mapaCaja: {
    backgroundColor: colores.blanco,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    position: "relative",
    zIndex: 1,
  },
  infoMapaTitulo: {
    flex: 1,
  },
  mapaTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: colores.texto,
    marginBottom: 3,
  },
  mapaDescripcion: {
    color: colores.gris,
    fontSize: 13,
    lineHeight: 19,
  },
  botonActualizar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colores.secundario,
    justifyContent: "center",
    alignItems: "center",
  },
  mapa: {
    height: 390,
    backgroundColor: "#EAF8F5",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BFE5DD",
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  imagenMapa: {
    width: "96%",
    height: "96%",
  },
  marcador: {
    position: "absolute",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 7,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  patitaInterna: {
    position: "absolute",
    top: 10,
    left: 15,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sinReportesMapa: {
    position: "absolute",
    bottom: 16,
    backgroundColor: colores.blanco,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  sinReportesTexto: {
    color: colores.gris,
    fontWeight: "bold",
    fontSize: 12,
  },
});
