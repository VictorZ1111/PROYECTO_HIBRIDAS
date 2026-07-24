import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

import {
  obtenerReportes,
  guardarReportes,
  eliminarReporteAdminApi,
  marcarReporteEncontradoApi,
  registrarAvistamientoApi,
  registrarContactoReporteApi,
} from "../servicios/almacenamientoReportes";
import {
  obtenerActividadLocal,
  guardarActividadLocal,
} from "../servicios/almacenamientoActividad";
import {
  obtenerUsuario,
  guardarUsuario,
  cerrarSesionLocal,
} from "../servicios/almacenamientoUsuario";

import Bienvenida from "../pantallas/Bienvenida";
import Login from "../pantallas/Login";
import MapaReportes from "../pantallas/MapaReportes";
import CrearReporte from "../pantallas/CrearReporte";
import EditarReporte from "../pantallas/EditarReporte";
import DetalleReporte from "../pantallas/DetalleReporte";
import MisReportes from "../pantallas/MisReportes";
import ReportarAvistamiento from "../pantallas/ReportarAvistamiento";
import Chat from "../pantallas/Chat";
import Perfil from "../pantallas/Perfil";
import Actividad from "../pantallas/Actividad";
import Admin from "../pantallas/Admin";
import AdminReportes from "../pantallas/AdminReportes";
import SeleccionarUbicacionMapa from "../pantallas/SeleccionarUbicacionMapa";
import DetalleAvistamientos from "../pantallas/DetalleAvistamientos";
import VistaImagen from "../pantallas/VistaImagen";
import { colores } from "../estilos/colores";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function obtenerFechaVisible() {
  return new Date().toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function TabsPrincipales({
  reportes,
  actividades,
  recargarDatos,
  actualizarReportes,
  usuario,
  cerrarSesion,
  actualizarUsuario,
}) {
  const insets = useSafeAreaInsets();
  const esAdmin = usuario?.rol === "admin";

  return (
    <Tab.Navigator
      sceneContainerStyle={{ backgroundColor: "transparent" }}
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FDE7DA",
        },
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 24,
        },
        headerShadowVisible: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#777777",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "bold",
          marginTop: -4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          height: 58 + insets.bottom,
          paddingTop: 4,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 7,
          borderTopWidth: 1,
          borderTopColor: "#DDDDDD",
        },
      }}
    >
      {esAdmin ? (
        <>
          <Tab.Screen
            name="InicioAdminTab"
            options={{
              title: "Inicio",
              tabBarLabel: "Inicio",
              tabBarIcon: ({ color, focused }) => (
                <MaterialCommunityIcons name="map-marker-radius-outline" size={focused ? 27 : 25} color={color} />
              ),
            }}
          >
            {(props) => (
              <MapaReportes
                {...props}
                reportes={reportes}
                recargarReportes={recargarDatos}
                usuario={usuario}
                modoAdmin
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="AdminUsuariosTab"
            options={{
              title: "Usuarios",
              tabBarLabel: "Usuarios",
              tabBarIcon: ({ color, focused }) => (
                <MaterialCommunityIcons name="account-group-outline" size={focused ? 27 : 25} color={color} />
              ),
            }}
          >
            {(props) => (
              <Admin
                {...props}
                reportes={reportes}
                actualizarReportes={actualizarReportes}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="AdminReportesTab"
            options={{
              title: "Reportes",
              tabBarLabel: "Reportes",
              tabBarIcon: ({ color, focused }) => (
                <MaterialCommunityIcons name="file-document-alert-outline" size={focused ? 27 : 25} color={color} />
              ),
            }}
          >
            {(props) => (
              <AdminReportes
                {...props}
                reportes={reportes}
                actualizarReportes={actualizarReportes}
              />
            )}
          </Tab.Screen>
        </>
      ) : (
        <>
          <Tab.Screen
            name="InicioTab"
            options={{
              title: "Inicio",
              tabBarLabel: "Inicio",
              tabBarIcon: ({ color, focused }) => (
                <MaterialCommunityIcons name="paw" size={focused ? 27 : 25} color={color} />
              ),
            }}
          >
            {(props) => (
              <MapaReportes
                {...props}
                reportes={reportes}
                recargarReportes={recargarDatos}
                usuario={usuario}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Actividad"
            options={{
              title: "Actividad",
              tabBarLabel: "Actividad",
              tabBarIcon: ({ color, focused }) => (
                <MaterialCommunityIcons name="bell-outline" size={focused ? 26 : 24} color={color} />
              ),
            }}
          >
            {(props) => (
              <Actividad
                {...props}
                reportes={reportes}
                actividades={actividades}
                usuario={usuario}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="MisReportesTab"
            options={{
              title: "Mis reportes",
              tabBarLabel: "Mis reportes",
              tabBarIcon: ({ color, focused }) => (
                <MaterialCommunityIcons name="bullhorn-outline" size={focused ? 27 : 25} color={color} />
              ),
            }}
          >
            {(props) => (
              <MisReportes
                {...props}
                reportes={reportes}
                usuario={usuario}
                actualizarReportes={actualizarReportes}
              />
            )}
          </Tab.Screen>
        </>
      )}

      <Tab.Screen
        name="Perfil"
        options={{
          title: "Perfil",
          tabBarLabel: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="person-outline" size={focused ? 26 : 24} color={color} />
          ),
        }}
      >
        {(props) => (
          <Perfil
            {...props}
            usuario={usuario}
            actualizarUsuario={actualizarUsuario}
            cerrarSesion={cerrarSesion}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function Navegacion() {
  const [reportes, setReportes] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [datosReportes, datosUsuario, datosActividad] = await Promise.all([
        obtenerReportes(),
        obtenerUsuario(),
        obtenerActividadLocal(),
      ]);

      setReportes(datosReportes);
      setUsuario(datosUsuario || null);
      setActividades(datosActividad);
    } finally {
      setCargandoDatos(false);
    }
  };

  const actualizarReportes = async (nuevosReportes) => {
    setReportes(nuevosReportes);
    await guardarReportes(nuevosReportes);
  };

  const actualizarActividades = async (nuevasActividades) => {
    setActividades(nuevasActividades);
    await guardarActividadLocal(nuevasActividades);
  };

  const registrarAvistamiento = async (reporteId, avistamiento) => {
    const avistamientoGuardado = await registrarAvistamientoApi(reporteId, avistamiento);

    const nuevosReportes = reportes.map((reporte) => {
      if (String(reporte.id) === String(reporteId)) {
        const avistamientosPrevios = reporte.avistamientos || [];

        return {
          ...reporte,
          avistamientos: [avistamientoGuardado, ...avistamientosPrevios],
          actualizadoEn: new Date().toISOString(),
          sincronizado: true,
          pendienteSincronizacion: false,
        };
      }

      return reporte;
    });

    await actualizarReportes(nuevosReportes);
    return avistamientoGuardado;
  };

  const registrarContactoReporte = async (reporte, tipoContacto) => {
    const esPropio =
      reporte?.usuarioId && usuario?.id
        ? String(reporte.usuarioId) === String(usuario.id)
        : reporte?.propio;

    if (usuario?.rol === "admin" || esPropio || reporte?.estado === "Encontrada") {
      return;
    }

    if (reporte?.id) {
      await registrarContactoReporteApi(reporte.id, tipoContacto);
    }
  };

  const marcarReporteEncontrado = async (reporte) => {
    const esPropio =
      reporte?.usuarioId && usuario?.id
        ? String(reporte.usuarioId) === String(usuario.id)
        : reporte?.propio;

    if (!esPropio || usuario?.rol === "admin") {
      return reporte;
    }

    const reporteActualizado = await marcarReporteEncontradoApi(reporte.id);

    const nuevosReportes = reportes.map((item) =>
      String(item.id) === String(reporte.id) ? reporteActualizado : item
    );

    await actualizarReportes(nuevosReportes);
    return reporteActualizado;
  };


  const eliminarReporteAdmin = async (reporte, motivoAdmin) => {
    if (usuario?.rol !== "admin") {
      return reporte;
    }

    const reporteActualizado = await eliminarReporteAdminApi(reporte.id, motivoAdmin);

    const nuevosReportes = reportes.map((item) =>
      String(item.id) === String(reporte.id) ? reporteActualizado : item
    );

    await actualizarReportes(nuevosReportes);
    return reporteActualizado;
  };

  const actualizarUsuario = async (nuevoUsuario) => {
    setUsuario(nuevoUsuario);
    await guardarUsuario(nuevoUsuario);

    if (nuevoUsuario) {
      const datosReportes = await obtenerReportes();
      setReportes(datosReportes);
    }
  };

  const cerrarSesion = async (navigation) => {
    setUsuario(null);
    await cerrarSesionLocal();

    const navegacionRaiz = navigation.getParent?.() || navigation;

    navegacionRaiz.reset({
      index: 0,
      routes: [{ name: "Bienvenida" }],
    });
  };

  if (cargandoDatos) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color={colores.principalOscuro} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={usuario ? "AppPrincipal" : "Bienvenida"}
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FDE7DA",
        },
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 23,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: "transparent",
        },
      }}
    >
      <Stack.Screen name="Bienvenida" options={{ headerShown: false }}>
        {(props) => <Bienvenida {...props} />}
      </Stack.Screen>

      <Stack.Screen name="Login" options={{ title: "Acceso" }}>
        {(props) => <Login {...props} setUsuario={actualizarUsuario} />}
      </Stack.Screen>

      <Stack.Screen name="AppPrincipal" options={{ headerShown: false }}>
        {(props) => (
          <TabsPrincipales
            {...props}
            reportes={reportes}
            actividades={actividades}
            recargarDatos={cargarDatos}
            actualizarReportes={actualizarReportes}
            usuario={usuario}
            cerrarSesion={cerrarSesion}
            actualizarUsuario={actualizarUsuario}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="CrearReporte" options={{ title: "Reportar mascota" }}>
        {(props) => (
          <CrearReporte
            {...props}
            reportes={reportes}
            actualizarReportes={actualizarReportes}
            usuario={usuario}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="EditarReporte" options={{ title: "Editar reporte" }}>
        {(props) => (
          <EditarReporte
            {...props}
            reportes={reportes}
            actualizarReportes={actualizarReportes}
            usuario={usuario}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="DetalleReporte" options={{ title: "Detalle del reporte" }}>
        {(props) => (
          <DetalleReporte
            {...props}
            usuario={usuario}
            marcarReporteEncontrado={marcarReporteEncontrado}
            eliminarReporteAdmin={eliminarReporteAdmin}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Chat" options={{ title: "Contacto" }}>
        {(props) => (
          <Chat
            {...props}
            usuario={usuario}
            registrarContactoReporte={registrarContactoReporte}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="SeleccionarUbicacionMapa" options={{ title: "Seleccionar ubicación" }}>
        {(props) => <SeleccionarUbicacionMapa {...props} />}
      </Stack.Screen>

      <Stack.Screen name="DetalleAvistamientos" options={{ title: "Avistamientos" }}>
        {(props) => <DetalleAvistamientos {...props} />}
      </Stack.Screen>

      <Stack.Screen name="VistaImagen" options={{ headerShown: false }}>
        {(props) => <VistaImagen {...props} />}
      </Stack.Screen>

      <Stack.Screen name="ReportarAvistamiento" options={{ title: "Avistamiento" }}>
        {(props) => (
          <ReportarAvistamiento
            {...props}
            usuario={usuario}
            registrarAvistamiento={registrarAvistamiento}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  cargando: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.fondo,
  },
});
