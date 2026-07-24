import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  limpiarTelefono,
  normalizarCorreo,
} from "../utilidades/validacionesAutenticacion";
import {
  borrarTokenApi,
  guardarTokenApi,
  obtenerTokenApi,
  peticionApi,
} from "./api";

const CLAVE_USUARIO = "usuario_actual";

function limpiarUsuarioParaSesion(usuario, token = null) {
  if (!usuario) {
    return null;
  }

  const usuarioSeguro = {
    id: usuario.id,
    nombreCompleto: usuario.nombreCompleto || usuario.name || "Usuario",
    telefono: usuario.telefono || "",
    correo: normalizarCorreo(usuario.correo || usuario.email || ""),
    fotoPerfil: usuario.fotoPerfil || usuario.foto_perfil || null,
    rol: usuario.rol || "usuario",
    estadoCuenta: usuario.estadoCuenta || usuario.estado_cuenta || "activo",
  };

  if (token || usuario.token) {
    usuarioSeguro.token = token || usuario.token;
  }

  return usuarioSeguro;
}

export async function obtenerUsuario() {
  try {
    const datos = await AsyncStorage.getItem(CLAVE_USUARIO);
    const usuarioGuardado = datos ? JSON.parse(datos) : null;
    const token = await obtenerTokenApi();

    if (!usuarioGuardado && !token) {
      return null;
    }

    if (token) {
      try {
        const respuesta = await peticionApi("/perfil");
        const usuarioApi = limpiarUsuarioParaSesion(respuesta.usuario, token);
        await AsyncStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuarioApi));
        return usuarioApi;
      } catch (error) {
        return limpiarUsuarioParaSesion(usuarioGuardado, token);
      }
    }

    return limpiarUsuarioParaSesion(usuarioGuardado);
  } catch (error) {
    console.log("Error al obtener usuario:", error);
    return null;
  }
}

export async function guardarUsuario(usuario) {
  const token = usuario?.token || await obtenerTokenApi();
  const usuarioSeguro = limpiarUsuarioParaSesion(usuario, token);

  if (!usuarioSeguro || usuarioSeguro.esInvitado) {
    return;
  }

  if (token) {
    await guardarTokenApi(token);
  }

  await AsyncStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuarioSeguro));
}


export async function actualizarPerfilUsuario({ nombreCompleto, telefono, fotoPerfil }) {
  const respuesta = await peticionApi("/perfil", {
    method: "PUT",
    body: {
      nombre_completo: nombreCompleto?.trim(),
      telefono: limpiarTelefono(telefono || ""),
      foto_perfil: fotoPerfil || null,
    },
  });

  const token = await obtenerTokenApi();
  const usuario = limpiarUsuarioParaSesion(respuesta.usuario, token);
  await AsyncStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));

  return usuario;
}

export async function registrarUsuarioLocal({
  nombreCompleto,
  telefono,
  correo,
  contrasena,
  respuestaSeguridad,
}) {
  const respuesta = await peticionApi("/registro", {
    method: "POST",
    auth: false,
    body: {
      nombre_completo: nombreCompleto.trim(),
      telefono: limpiarTelefono(telefono),
      correo: normalizarCorreo(correo),
      password: String(contrasena).trim(),
      password_confirmation: contrasena,
      mascota_favorita: respuestaSeguridad.trim(),
    },
  });

  return limpiarUsuarioParaSesion(respuesta.usuario);
}

export async function iniciarSesionLocal(correo, contrasena) {
  const respuesta = await peticionApi("/login", {
    method: "POST",
    auth: false,
    body: {
      correo: normalizarCorreo(correo),
      password: String(contrasena).trim(),
    },
  });

  const usuario = limpiarUsuarioParaSesion(respuesta.usuario, respuesta.token);
  await guardarTokenApi(respuesta.token);
  await AsyncStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));

  return usuario;
}

export async function verificarRespuestaRecuperacionLocal({
  correo,
  respuestaSeguridad,
}) {
  await peticionApi("/recuperacion/verificar", {
    method: "POST",
    auth: false,
    body: {
      correo: normalizarCorreo(correo),
      mascota_favorita: respuestaSeguridad.trim(),
    },
  });

  return true;
}

export async function restablecerContrasenaLocal({
  correo,
  respuestaSeguridad,
  nuevaContrasena,
}) {
  await peticionApi("/recuperacion/restablecer", {
    method: "POST",
    auth: false,
    body: {
      correo: normalizarCorreo(correo),
      mascota_favorita: respuestaSeguridad.trim(),
      password: String(nuevaContrasena).trim(),
      password_confirmation: String(nuevaContrasena).trim(),
    },
  });

  return true;
}

export async function obtenerUsuariosRegistradosParaAdmin() {
  const respuesta = await peticionApi("/admin/usuarios");
  return (respuesta.usuarios || []).map((usuario) => limpiarUsuarioParaSesion(usuario));
}

export async function cambiarEstadoUsuarioRegistrado(usuarioId, estadoCuenta) {
  const respuesta = await peticionApi(`/admin/usuarios/${usuarioId}/estado`, {
    method: "PATCH",
    body: {
      estado_cuenta: estadoCuenta,
    },
  });

  return limpiarUsuarioParaSesion(respuesta.usuario);
}

export async function eliminarUsuarioRegistrado(usuarioId) {
  await peticionApi(`/admin/usuarios/${usuarioId}`, {
    method: "DELETE",
  });

  return true;
}

export function crearUsuarioInvitado() {
  return {
    id: "invitado-temporal",
    nombreCompleto: "Invitado",
    telefono: "",
    correo: "",
    fotoPerfil: null,
    rol: "invitado",
    estadoCuenta: "temporal",
    esInvitado: true,
  };
}

export async function cerrarSesionLocal() {
  try {
    const token = await obtenerTokenApi();

    if (token) {
      try {
        await peticionApi("/logout", { method: "POST" });
      } catch (error) {
        console.log("No se pudo cerrar sesión en API:", error.message);
      }
    }

    await borrarTokenApi();
    await AsyncStorage.removeItem(CLAVE_USUARIO);
  } catch (error) {
    console.log("Error al cerrar sesión:", error);
  }
}
