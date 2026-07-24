import AsyncStorage from "@react-native-async-storage/async-storage";
import { reportesIniciales } from "../datos/reportesIniciales";
import { peticionApi } from "./api";

const CLAVE_REPORTES = "reportes_mascotas";
const CLAVE_USUARIO = "usuario_actual";

function convertirFecha(valor) {
  if (!valor) {
    return new Date().toLocaleDateString("es-EC");
  }

  const fecha = new Date(String(valor).replace(" ", "T"));

  if (Number.isNaN(fecha.getTime())) {
    return String(valor);
  }

  return fecha.toLocaleDateString("es-EC");
}

async function obtenerUsuarioSesion() {
  try {
    const datos = await AsyncStorage.getItem(CLAVE_USUARIO);
    return datos ? JSON.parse(datos) : null;
  } catch (error) {
    return null;
  }
}

function normalizarUsuario(usuario) {
  if (!usuario) {
    return null;
  }

  return {
    id: usuario.id,
    nombreCompleto: usuario.nombreCompleto || usuario.name || "Usuario",
    telefono: usuario.telefono || "",
    correo: usuario.correo || usuario.email || "",
    rol: usuario.rol || "usuario",
    fotoPerfil: usuario.fotoPerfil || usuario.foto_perfil || null,
    estadoCuenta: usuario.estadoCuenta || usuario.estado_cuenta || "activo",
  };
}

export function normalizarAvistamientoApi(avistamiento) {
  const usuario = normalizarUsuario(avistamiento?.usuario);

  return {
    id: avistamiento?.id || Date.now(),
    reporteId: avistamiento?.reporteId || avistamiento?.reporte_id || null,
    usuarioId: avistamiento?.userId || avistamiento?.usuarioId || avistamiento?.user_id || null,
    userId: avistamiento?.userId || avistamiento?.usuarioId || avistamiento?.user_id || null,
    usuario,
    observacion: avistamiento?.observacion || "Sin observación",
    telefono: avistamiento?.telefono || avistamiento?.telefonoContacto || "",
    telefonoContacto: avistamiento?.telefono || avistamiento?.telefonoContacto || "",
    imagen: avistamiento?.imagen || null,
    latitud: avistamiento?.latitud !== undefined && avistamiento?.latitud !== null ? Number(avistamiento.latitud) : null,
    longitud: avistamiento?.longitud !== undefined && avistamiento?.longitud !== null ? Number(avistamiento.longitud) : null,
    fecha: avistamiento?.fecha || convertirFecha(avistamiento?.creadoEn || avistamiento?.created_at),
    creadoEn: avistamiento?.creadoEn || avistamiento?.created_at || new Date().toISOString(),
    usuarioNombre: usuario?.nombreCompleto || avistamiento?.usuarioNombre || "Usuario",
    usuarioFoto: usuario?.fotoPerfil || avistamiento?.usuarioFoto || null,
    reporte: avistamiento?.reporte || null,
  };
}

export function obtenerEstadoVisible(estado) {
  const texto = String(estado || "perdida").toLowerCase();
  return texto === "encontrada" ? "Encontrada" : "Perdida";
}

function normalizarReporteApi(reporte, usuarioActual = null) {
  const usuarioReporte = normalizarUsuario(reporte?.usuario);
  const usuarioId = reporte?.usuarioId || reporte?.userId || reporte?.user_id || null;
  const telefono = reporte?.telefono || reporte?.telefonoContacto || reporte?.telefono_contacto || "";
  const estadoReporte = reporte?.estadoReporte || reporte?.estado_reporte || "activo";
  const observacionAdmin = reporte?.motivoAdmin || reporte?.observacionAdmin || reporte?.observacion_admin || null;
  const fechaObservacionAdmin = reporte?.fechaMotivoAdmin || reporte?.fechaObservacionAdmin || reporte?.fecha_observacion_admin || null;
  const creadoEn = reporte?.creadoEn || reporte?.created_at || new Date().toISOString();
  const fechaEncontrada = reporte?.fechaEncontrada || reporte?.fecha_encontrada || null;

  return {
    ...reporte,
    id: reporte?.id || Date.now(),
    userId: usuarioId,
    usuarioId,
    usuario: usuarioReporte,
    nombreMascota: reporte?.nombreMascota || reporte?.nombre_mascota || "Mascota",
    tipoMascota: reporte?.tipoMascota || reporte?.tipo_mascota || reporte?.tipo || "Mascota",
    raza: reporte?.raza || "No especificada",
    color: reporte?.color || "No especificado",
    descripcion: reporte?.descripcion || "Sin descripción",
    estado: obtenerEstadoVisible(reporte?.estado),
    estadoReporte,
    provincia: reporte?.provincia || "Sin provincia",
    ciudad: reporte?.ciudad || "Sin ciudad",
    sector: reporte?.sector || "Sin sector",
    telefono,
    telefonoContacto: telefono,
    imagen: reporte?.imagen || "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=900",
    latitud: reporte?.latitud !== undefined && reporte?.latitud !== null ? Number(reporte.latitud) : null,
    longitud: reporte?.longitud !== undefined && reporte?.longitud !== null ? Number(reporte.longitud) : null,
    motivoAdmin: observacionAdmin,
    observacionAdmin,
    fechaMotivoAdmin: fechaObservacionAdmin,
    fechaObservacionAdmin,
    fechaEncontrada: fechaEncontrada ? convertirFecha(fechaEncontrada) : null,
    fecha: reporte?.fecha || convertirFecha(creadoEn),
    creadoEn,
    actualizadoEn: reporte?.actualizadoEn || reporte?.updated_at || creadoEn,
    propio: usuarioActual?.id && usuarioId ? String(usuarioActual.id) === String(usuarioId) : !!reporte?.propio,
    usuarioNombre: reporte?.usuarioNombre || usuarioReporte?.nombreCompleto || "Usuario del reporte",
    usuarioFoto: reporte?.usuarioFoto || usuarioReporte?.fotoPerfil || null,
    avistamientos: Array.isArray(reporte?.avistamientos)
      ? reporte.avistamientos.map(normalizarAvistamientoApi)
      : [],
    sincronizado: true,
    pendienteSincronizacion: false,
  };
}

async function obtenerReportesCache() {
  try {
    const datos = await AsyncStorage.getItem(CLAVE_REPORTES);

    if (datos) {
      const usuario = await obtenerUsuarioSesion();
      return JSON.parse(datos).map((reporte) => normalizarReporteApi(reporte, usuario));
    }

    await AsyncStorage.setItem(CLAVE_REPORTES, JSON.stringify(reportesIniciales));
    return reportesIniciales.map(normalizarReporteApi);
  } catch (error) {
    console.log("Error al obtener reportes locales:", error);
    return reportesIniciales.map(normalizarReporteApi);
  }
}

function unirReportes(...listas) {
  const mapa = new Map();

  listas.flat().forEach((reporte) => {
    if (!reporte?.id) return;
    mapa.set(String(reporte.id), {
      ...(mapa.get(String(reporte.id)) || {}),
      ...reporte,
    });
  });

  return Array.from(mapa.values()).sort((a, b) => {
    const fechaA = new Date(a.actualizadoEn || a.creadoEn || 0).getTime();
    const fechaB = new Date(b.actualizadoEn || b.creadoEn || 0).getTime();
    return fechaB - fechaA;
  });
}

function adjuntarAvistamientos(reportes, avistamientos) {
  const mapa = new Map(reportes.map((reporte) => [String(reporte.id), { ...reporte, avistamientos: [] }]));

  avistamientos.forEach((avistamiento) => {
    const clave = String(avistamiento.reporteId || "");
    const reporteExistente = mapa.get(clave);

    if (reporteExistente) {
      const yaExiste = reporteExistente.avistamientos.some(
        (item) => String(item.id) === String(avistamiento.id)
      );

      if (!yaExiste) {
        reporteExistente.avistamientos.push(avistamiento);
      }
    }
  });

  return Array.from(mapa.values());
}

export async function obtenerReportes() {
  const usuario = await obtenerUsuarioSesion();

  if (!usuario?.token) {
    return obtenerReportesCache();
  }

  try {
    const respuestaReportes = usuario.rol === "admin"
      ? await peticionApi("/admin/reportes")
      : await peticionApi("/reportes");

    let reportesApi = (respuestaReportes.reportes || []).map((reporte) => normalizarReporteApi(reporte, usuario));

    if (usuario.rol !== "admin") {
      try {
        const respuestaMisReportes = await peticionApi("/mis-reportes");
        const misReportes = (respuestaMisReportes.reportes || []).map((reporte) => normalizarReporteApi(reporte, usuario));
        reportesApi = unirReportes(reportesApi, misReportes);
      } catch (error) {
        console.log("No se pudieron cargar mis reportes:", error.message);
      }

      try {
        const [recibidos, enviados] = await Promise.all([
          peticionApi("/mis-avistamientos/recibidos").catch(() => ({ avistamientos: [] })),
          peticionApi("/mis-avistamientos/enviados").catch(() => ({ avistamientos: [] })),
        ]);

        const avistamientos = [
          ...(recibidos.avistamientos || []),
          ...(enviados.avistamientos || []),
        ].map(normalizarAvistamientoApi);

        reportesApi = adjuntarAvistamientos(reportesApi, avistamientos);
      } catch (error) {
        console.log("No se pudieron cargar avistamientos:", error.message);
      }
    }

    await guardarReportes(reportesApi);
    return reportesApi;
  } catch (error) {
    console.log("Error al obtener reportes desde API:", error.message);
    return obtenerReportesCache();
  }
}

export async function guardarReportes(reportes) {
  try {
    await AsyncStorage.setItem(CLAVE_REPORTES, JSON.stringify(reportes));
  } catch (error) {
    console.log("Error al guardar reportes:", error);
  }
}

export async function crearReporteApi(reporte) {
  const respuesta = await peticionApi("/reportes", {
    method: "POST",
    body: {
      nombre_mascota: reporte.nombreMascota,
      tipo_mascota: reporte.tipoMascota,
      estado: reporte.estado || "Perdida",
      raza: reporte.raza,
      color: reporte.color,
      descripcion: reporte.descripcion,
      provincia: reporte.provincia,
      ciudad: reporte.ciudad,
      sector: reporte.sector,
      telefono_contacto: reporte.telefono || reporte.telefonoContacto,
      imagen: reporte.imagen,
      latitud: reporte.latitud,
      longitud: reporte.longitud,
    },
  });

  const usuario = await obtenerUsuarioSesion();
  return normalizarReporteApi(respuesta.reporte, usuario);
}

export async function actualizarReporteApi(reporteId, datosReporte) {
  const respuesta = await peticionApi(`/reportes/${reporteId}`, {
    method: "PUT",
    body: {
      nombre_mascota: datosReporte.nombreMascota,
      tipo_mascota: datosReporte.tipoMascota,
      raza: datosReporte.raza,
      color: datosReporte.color,
      descripcion: datosReporte.descripcion,
      provincia: datosReporte.provincia,
      ciudad: datosReporte.ciudad,
      sector: datosReporte.sector,
      telefono_contacto: datosReporte.telefono || datosReporte.telefonoContacto,
      imagen: datosReporte.imagen,
      latitud: datosReporte.latitud,
      longitud: datosReporte.longitud,
    },
  });

  const usuario = await obtenerUsuarioSesion();
  return normalizarReporteApi(respuesta.reporte, usuario);
}

export async function eliminarReporteApi(reporteId) {
  await peticionApi(`/reportes/${reporteId}`, {
    method: "DELETE",
  });

  return true;
}

export async function marcarReporteEncontradoApi(reporteId) {
  const respuesta = await peticionApi(`/reportes/${reporteId}/encontrada`, {
    method: "PATCH",
  });

  const usuario = await obtenerUsuarioSesion();
  return normalizarReporteApi(respuesta.reporte, usuario);
}

export async function eliminarReporteAdminApi(reporteId, observacionAdmin) {
  const respuesta = await peticionApi(`/admin/reportes/${reporteId}/eliminar`, {
    method: "PATCH",
    body: {
      observacion_admin: observacionAdmin,
    },
  });

  const usuario = await obtenerUsuarioSesion();
  return normalizarReporteApi(respuesta.reporte, usuario);
}

export async function registrarAvistamientoApi(reporteId, avistamiento) {
  const respuesta = await peticionApi(`/reportes/${reporteId}/avistamientos`, {
    method: "POST",
    body: {
      observacion: avistamiento.observacion,
      telefono: avistamiento.telefono || avistamiento.telefonoContacto,
      imagen: avistamiento.imagen,
      latitud: avistamiento.latitud,
      longitud: avistamiento.longitud,
    },
  });

  return normalizarAvistamientoApi(respuesta.avistamiento);
}

export async function registrarContactoReporteApi(reporteId, tipoContacto) {
  const respuesta = await peticionApi(`/reportes/${reporteId}/contactos`, {
    method: "POST",
    body: {
      tipo_contacto: tipoContacto,
    },
  });

  return respuesta.contacto;
}
