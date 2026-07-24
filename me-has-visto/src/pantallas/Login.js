import React, { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  TouchableOpacity,
  Image,
} from "react-native";

import CampoTexto from "../componentes/CampoTexto";
import Boton from "../componentes/Boton";
import AlertaBonita from "../componentes/AlertaBonita";
import { colores } from "../estilos/colores";
import {
  iniciarSesionLocal,
  registrarUsuarioLocal,
  restablecerContrasenaLocal,
  verificarRespuestaRecuperacionLocal,
} from "../servicios/almacenamientoUsuario";
import {
  normalizarCorreo,
  validarContrasena,
  validarCorreo,
  validarNombreCompleto,
  validarTelefono,
  validarRespuestaSeguridad,
  obtenerMensajeContrasena,
  obtenerMensajeRespuestaSeguridad,
} from "../utilidades/validacionesAutenticacion";

export default function Login({ route, navigation, setUsuario }) {
  const [modo, setModo] = useState("inicio");

  const [correoLogin, setCorreoLogin] = useState("");
  const [contrasenaLogin, setContrasenaLogin] = useState("");

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correoRegistro, setCorreoRegistro] = useState("");
  const [respuestaSeguridad, setRespuestaSeguridad] = useState("");
  const [contrasenaRegistro, setContrasenaRegistro] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const [correoRecuperacion, setCorreoRecuperacion] = useState("");
  const [respuestaRecuperacion, setRespuestaRecuperacion] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarNuevaContrasena, setConfirmarNuevaContrasena] = useState("");
  const [recuperacionVerificada, setRecuperacionVerificada] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [registroIntentado, setRegistroIntentado] = useState(false);
  const [recuperacionIntentada, setRecuperacionIntentada] = useState(false);

  useEffect(() => {
    if (route?.params?.modoInicial === "registro") {
      setModo("registro");
    }
  }, [route?.params?.modoInicial]);

  const cerrarAlerta = () => setAlerta(null);

  const mostrarAlerta = (titulo, mensaje, tipo = "info", botones = []) => {
    setAlerta({ titulo, mensaje, tipo, botones });
  };

  const cambiarModo = (nuevoModo) => {
    if (nuevoModo !== "recuperar") {
      setRecuperacionVerificada(false);
      setRecuperacionIntentada(false);
      setCorreoRecuperacion("");
      setRespuestaRecuperacion("");
      setNuevaContrasena("");
      setConfirmarNuevaContrasena("");
    }

    setModo(nuevoModo);
  };

  const entrarAApp = async (usuario) => {
    await setUsuario(usuario);

    navigation.reset({
      index: 0,
      routes: [{ name: "AppPrincipal" }],
    });
  };

  const iniciarSesion = async () => {
    const correoNormalizado = normalizarCorreo(correoLogin);

    if (!correoNormalizado) {
      mostrarAlerta("Correo requerido", "Ingresa el correo de tu cuenta.", "advertencia");
      return;
    }

    if (!validarCorreo(correoNormalizado)) {
      mostrarAlerta("Correo inválido", "El correo debe terminar en @mehasvisto.com.", "advertencia");
      return;
    }

    if (!contrasenaLogin) {
      mostrarAlerta("Contraseña requerida", "Ingresa tu contraseña.", "advertencia");
      return;
    }

    setCargando(true);

    try {
      const usuario = await iniciarSesionLocal(
        correoNormalizado,
        contrasenaLogin
      );

      await entrarAApp(usuario);
    } catch (error) {
      mostrarAlerta("No se pudo iniciar sesión", error.message || "Revisa tus datos e inténtalo nuevamente.", "error");
    } finally {
      setCargando(false);
    }
  };

  const registrar = async () => {
    const correoNormalizado = normalizarCorreo(correoRegistro);
    setRegistroIntentado(true);

    if (!validarNombreCompleto(nombreCompleto)) {
      mostrarAlerta("Nombre incompleto", "Ingresa al menos tu nombre y apellido.", "advertencia");
      return;
    }

    if (!validarTelefono(telefono)) {
      mostrarAlerta("Teléfono inválido", "El teléfono es obligatorio y debe tener 10 dígitos. Ejemplo: 0999999999.", "advertencia");
      return;
    }

    if (!correoNormalizado) {
      mostrarAlerta("Correo requerido", "Ingresa tu correo electrónico.", "advertencia");
      return;
    }

    if (!validarCorreo(correoNormalizado)) {
      mostrarAlerta("Correo inválido", "El correo debe terminar en @mehasvisto.com.", "advertencia");
      return;
    }

    if (!validarRespuestaSeguridad(respuestaSeguridad)) {
      mostrarAlerta("Respuesta requerida", `Escribe el nombre de tu mascota favorita para poder recuperar tu cuenta. ${obtenerMensajeRespuestaSeguridad()}`, "advertencia");
      return;
    }

    if (!validarContrasena(contrasenaRegistro)) {
      return;
    }

    if (contrasenaRegistro !== confirmarContrasena) {
      return;
    }

    setCargando(true);

    try {
      await registrarUsuarioLocal({
        nombreCompleto,
        telefono,
        correo: correoNormalizado,
        contrasena: contrasenaRegistro,
        respuestaSeguridad,
      });

      mostrarAlerta("Cuenta creada", "Tu cuenta fue creada correctamente. Ahora inicia sesión con tu correo y contraseña.", "exito");

      setCorreoLogin(correoNormalizado);
      setContrasenaLogin("");
      setNombreCompleto("");
      setTelefono("");
      setCorreoRegistro("");
      setRespuestaSeguridad("");
      setContrasenaRegistro("");
      setConfirmarContrasena("");
      setRegistroIntentado(false);
      setModo("inicio");
    } catch (error) {
      mostrarAlerta("No se pudo crear la cuenta", error.message || "Revisa tus datos e inténtalo nuevamente.", "error");
    } finally {
      setCargando(false);
    }
  };

  const validarDatosRecuperacion = async () => {
    const correoNormalizado = normalizarCorreo(correoRecuperacion);

    if (!validarCorreo(correoNormalizado)) {
      mostrarAlerta("Correo inválido", "Ingresa el correo @mehasvisto.com de tu cuenta.", "advertencia");
      return;
    }

    if (!validarRespuestaSeguridad(respuestaRecuperacion)) {
      mostrarAlerta("Respuesta inválida", `La respuesta debe ser el nombre de tu mascota favorita en una sola palabra. ${obtenerMensajeRespuestaSeguridad()}`, "advertencia");
      return;
    }

    setCargando(true);

    try {
      await verificarRespuestaRecuperacionLocal({
        correo: correoNormalizado,
        respuestaSeguridad: respuestaRecuperacion,
      });

      setRecuperacionVerificada(true);
      mostrarAlerta("Datos verificados", "Ahora puedes ingresar una nueva contraseña.", "exito");
    } catch (error) {
      setRecuperacionVerificada(false);
      mostrarAlerta("No se pudo validar", error.message || "Revisa tu correo y la respuesta de recuperación.", "error");
    } finally {
      setCargando(false);
    }
  };

  const restablecerContrasena = async () => {
    const correoNormalizado = normalizarCorreo(correoRecuperacion);
    setRecuperacionIntentada(true);

    if (!recuperacionVerificada) {
      mostrarAlerta("Primero valida tu cuenta", "Valida el correo y la respuesta antes de cambiar la contraseña.", "advertencia");
      return;
    }

    if (!validarContrasena(nuevaContrasena)) {
      return;
    }

    if (nuevaContrasena !== confirmarNuevaContrasena) {
      return;
    }

    setCargando(true);

    try {
      await restablecerContrasenaLocal({
        correo: correoNormalizado,
        respuestaSeguridad: respuestaRecuperacion,
        nuevaContrasena,
      });

      mostrarAlerta("Contraseña actualizada", "Ahora puedes iniciar sesión con tu nueva contraseña.", "exito");

      setCorreoLogin(correoNormalizado);
      setContrasenaLogin("");
      setCorreoRecuperacion("");
      setRespuestaRecuperacion("");
      setNuevaContrasena("");
      setConfirmarNuevaContrasena("");
      setRecuperacionVerificada(false);
      setRecuperacionIntentada(false);
      setModo("inicio");
    } catch (error) {
      mostrarAlerta("No se pudo restablecer", error.message || "Revisa los datos de recuperación.", "error");
    } finally {
      setCargando(false);
    }
  };

  const mensajeContrasenaRegistro =
    (registroIntentado || contrasenaRegistro.length > 0) && !validarContrasena(contrasenaRegistro)
      ? obtenerMensajeContrasena()
      : "";

  const mensajeConfirmarRegistro =
    (registroIntentado || confirmarContrasena.length > 0) &&
    confirmarContrasena.length > 0 &&
    contrasenaRegistro !== confirmarContrasena
      ? "Las contraseñas no coinciden."
      : "";

  const mensajeNuevaContrasena =
    (recuperacionIntentada || nuevaContrasena.length > 0) && !validarContrasena(nuevaContrasena)
      ? obtenerMensajeContrasena()
      : "";

  const mensajeConfirmarNuevaContrasena =
    (recuperacionIntentada || confirmarNuevaContrasena.length > 0) &&
    confirmarNuevaContrasena.length > 0 &&
    nuevaContrasena !== confirmarNuevaContrasena
      ? "Las contraseñas no coinciden."
      : "";

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        style={styles.contenedor}
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.encabezadoAuth}>
          <Image source={require("../../assets/icon.png")} style={styles.iconoAuth} resizeMode="contain" />
          <Text style={styles.titulo}>Acceso a la app</Text>
        </View>

        <Text style={styles.descripcion}>
          Inicia sesión o crea tu cuenta para publicar reportes y recibir
          información de avistamientos.
        </Text>

        <View style={styles.selectorModo}>
          <TouchableOpacity
            style={[
              styles.opcionModo,
              modo === "inicio" && styles.opcionModoActiva,
            ]}
            onPress={() => cambiarModo("inicio")}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.textoModo,
                modo === "inicio" && styles.textoModoActivo,
              ]}
            >
              Inicio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.opcionModo,
              modo === "registro" && styles.opcionModoActiva,
            ]}
            onPress={() => cambiarModo("registro")}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.textoModo,
                modo === "registro" && styles.textoModoActivo,
              ]}
            >
              Registro
            </Text>
          </TouchableOpacity>
        </View>

        {modo === "inicio" && (
          <View style={styles.caja}>
            <Text style={styles.seccion}>Iniciar sesión</Text>

            <CampoTexto
              placeholder="Correo @mehasvisto.com"
              value={correoLogin}
              onChangeText={setCorreoLogin}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <CampoTexto
              placeholder="Contraseña"
              value={contrasenaLogin}
              onChangeText={setContrasenaLogin}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              maxLength={10}
              returnKeyType="done"
              onSubmitEditing={iniciarSesion}
            />

            <Boton
              texto="Iniciar sesión"
              onPress={iniciarSesion}
              cargando={cargando}
            />

            <TouchableOpacity
              style={styles.linkRecuperar}
              onPress={() => cambiarModo("recuperar")}
              activeOpacity={0.85}
            >
              <Text style={styles.linkRecuperarTexto}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>
        )}

        {modo === "registro" && (
          <View style={styles.caja}>
            <Text style={styles.seccion}>Crear cuenta</Text>

            <CampoTexto
              placeholder="Nombre completo"
              value={nombreCompleto}
              onChangeText={setNombreCompleto}
              autoComplete="name"
              textContentType="name"
              maxLength={60}
            />

            <CampoTexto
              placeholder="Teléfono obligatorio, 10 dígitos"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              maxLength={10}
            />

            <CampoTexto
              placeholder="Correo @mehasvisto.com"
              value={correoRegistro}
              onChangeText={setCorreoRegistro}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />

            <CampoTexto
              placeholder="Mascota favorita para recuperar cuenta"
              value={respuestaSeguridad}
              onChangeText={setRespuestaSeguridad}
              autoCapitalize="words"
              maxLength={20}
            />

            <Text style={styles.ayudaCampo}>
              Usa una sola palabra. Ejemplo: Firulais.
            </Text>

            <CampoTexto
              placeholder="Contraseña"
              value={contrasenaRegistro}
              onChangeText={setContrasenaRegistro}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              maxLength={10}
            />

            {!!mensajeContrasenaRegistro && (
              <Text style={styles.errorCampo}>{mensajeContrasenaRegistro}</Text>
            )}

            <CampoTexto
              placeholder="Confirmar contraseña"
              value={confirmarContrasena}
              onChangeText={setConfirmarContrasena}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              maxLength={10}
              returnKeyType="done"
              onSubmitEditing={registrar}
            />

            {!!mensajeConfirmarRegistro && (
              <Text style={styles.errorCampo}>{mensajeConfirmarRegistro}</Text>
            )}

            <Boton texto="Crear cuenta" onPress={registrar} cargando={cargando} />
          </View>
        )}

        {modo === "recuperar" && (
          <View style={styles.caja}>
            <Text style={styles.seccion}>Restablecer contraseña</Text>
            <Text style={styles.textoRecuperacion}>
              Para validar tu cuenta, responde con el nombre de tu mascota favorita que registraste.
            </Text>

            <CampoTexto
              placeholder="Correo @mehasvisto.com"
              value={correoRecuperacion}
              onChangeText={(valor) => {
                setCorreoRecuperacion(valor);
                setRecuperacionVerificada(false);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <CampoTexto
              placeholder="Nombre de tu mascota favorita"
              value={respuestaRecuperacion}
              onChangeText={(valor) => {
                setRespuestaRecuperacion(valor);
                setRecuperacionVerificada(false);
              }}
              autoCapitalize="words"
              maxLength={20}
            />

            {!recuperacionVerificada ? (
              <Boton
                texto="Validar datos"
                onPress={validarDatosRecuperacion}
                cargando={cargando}
              />
            ) : (
              <>
                <View style={styles.avisoVerificado}>
                  <Text style={styles.avisoVerificadoTexto}>
                    Cuenta validada. Ingresa tu nueva contraseña.
                  </Text>
                </View>

                <CampoTexto
                  placeholder="Nueva contraseña"
                  value={nuevaContrasena}
                  onChangeText={setNuevaContrasena}
                  secureTextEntry
                  autoCapitalize="none"
                  maxLength={10}
                />

                {!!mensajeNuevaContrasena && (
                  <Text style={styles.errorCampo}>{mensajeNuevaContrasena}</Text>
                )}

                <CampoTexto
                  placeholder="Confirmar nueva contraseña"
                  value={confirmarNuevaContrasena}
                  onChangeText={setConfirmarNuevaContrasena}
                  secureTextEntry
                  autoCapitalize="none"
                  maxLength={10}
                  returnKeyType="done"
                  onSubmitEditing={restablecerContrasena}
                />

                {!!mensajeConfirmarNuevaContrasena && (
                  <Text style={styles.errorCampo}>{mensajeConfirmarNuevaContrasena}</Text>
                )}

                <Boton
                  texto="Guardar nueva contraseña"
                  onPress={restablecerContrasena}
                  cargando={cargando}
                />
              </>
            )}

            <Boton
              texto="Cancelar"
              tipo="rojo"
              onPress={() => cambiarModo("inicio")}
            />
          </View>
        )}

      </ScrollView>

      <AlertaBonita
        visible={!!alerta}
        tipo={alerta?.tipo}
        titulo={alerta?.titulo}
        mensaje={alerta?.mensaje}
        botones={alerta?.botones}
        onCerrar={cerrarAlerta}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenedor: {
    flex: 1,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 18,
    paddingBottom: 70,
  },
  encabezadoAuth: {
    alignItems: "center",
    marginBottom: 10,
  },
  iconoAuth: {
    width: 110,
    height: 110,
    marginBottom: 8,
  },
  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    color: colores.texto,
    marginBottom: 6,
    textAlign: "center",
  },
  descripcion: {
    color: colores.gris,
    marginBottom: 16,
    lineHeight: 21,
    fontSize: 14,
    textAlign: "center",
  },
  selectorModo: {
    flexDirection: "row",
    backgroundColor: colores.blanco,
    borderRadius: 16,
    padding: 5,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 14,
  },
  opcionModo: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  opcionModoActiva: {
    backgroundColor: colores.principal,
  },
  textoModo: {
    color: colores.gris,
    fontWeight: "bold",
  },
  textoModoActivo: {
    color: colores.blanco,
  },
  caja: {
    backgroundColor: colores.blanco,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  seccion: {
    fontSize: 18,
    fontWeight: "bold",
    color: colores.texto,
    marginBottom: 10,
  },
  ayudaCampo: {
    color: colores.gris,
    fontSize: 12,
    marginTop: -2,
    marginBottom: 8,
    lineHeight: 17,
  },
  errorCampo: {
    color: colores.rojo,
    fontSize: 12,
    fontWeight: "600",
    marginTop: -2,
    marginBottom: 8,
    lineHeight: 17,
  },
  linkRecuperar: {
    marginTop: 12,
    alignItems: "center",
  },
  linkRecuperarTexto: {
    color: colores.principalOscuro,
    fontWeight: "bold",
  },
  textoRecuperacion: {
    color: colores.gris,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  avisoVerificado: {
    backgroundColor: colores.verdeClaro,
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
  },
  avisoVerificadoTexto: {
    color: colores.secundario,
    fontWeight: "bold",
    fontSize: 13,
  },
  nota: {
    color: colores.gris,
    textAlign: "center",
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
  },
});
