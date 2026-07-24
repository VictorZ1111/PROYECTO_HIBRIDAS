const DOMINIO_CORREO_APP = "@mehasvisto.com";

export function normalizarCorreo(correo = "") {
  return correo.trim().toLowerCase();
}

export function validarCorreo(correo = "") {
  const correoNormalizado = normalizarCorreo(correo);

  return /^[^\s@]+@mehasvisto\.com$/.test(correoNormalizado);
}

export function obtenerDominioCorreoApp() {
  return DOMINIO_CORREO_APP;
}

export function limpiarTelefono(telefono = "") {
  return telefono.replace(/\D/g, "").trim();
}

export function validarTelefono(telefono = "") {
  const telefonoLimpio = limpiarTelefono(telefono);

  return /^09\d{8}$/.test(telefonoLimpio);
}

export function validarNombreCompleto(nombreCompleto = "") {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);

  return partes.length >= 2 && nombreCompleto.trim().length >= 5;
}

export function validarContrasena(contrasena = "") {
  const tieneLongitudValida = contrasena.length >= 8 && contrasena.length <= 10;
  const tieneMayuscula = /[A-Z]/.test(contrasena);
  const tieneMinuscula = /[a-z]/.test(contrasena);
  const tieneNumero = /\d/.test(contrasena);
  const tieneCaracterEspecial = /[^A-Za-z0-9]/.test(contrasena);

  return (
    tieneLongitudValida &&
    tieneMayuscula &&
    tieneMinuscula &&
    tieneNumero &&
    tieneCaracterEspecial
  );
}

export function obtenerMensajeContrasena() {
  return "Debe tener entre 8 y 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial.";
}

export function normalizarRespuestaSeguridad(respuesta = "") {
  return respuesta.trim().toLowerCase();
}

export function validarRespuestaSeguridad(respuesta = "") {
  const respuestaNormalizada = normalizarRespuestaSeguridad(respuesta);

  return /^[a-záéíóúñü0-9]{2,20}$/i.test(respuestaNormalizada);
}

export function obtenerMensajeRespuestaSeguridad() {
  return "Ingresa una sola palabra, sin espacios. Ejemplo: Firulais.";
}
