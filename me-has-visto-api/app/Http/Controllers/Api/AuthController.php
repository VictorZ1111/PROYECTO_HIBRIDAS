<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    private function formatoUsuario(User $usuario): array
    {
        return [
            'id' => $usuario->id,
            'nombreCompleto' => $usuario->name,
            'telefono' => $usuario->telefono,
            'correo' => $usuario->email,
            'rol' => $usuario->rol,
            'fotoPerfil' => $usuario->foto_perfil,
            'estadoCuenta' => $usuario->estado_cuenta,
        ];
    }

    private function normalizarRespuesta(?string $respuesta): string
    {
        return mb_strtolower(trim((string) $respuesta));
    }

    private function reglasContrasena(): array
    {
        return [
            'required',
            'string',
            'min:8',
            'max:10',
            'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/',
        ];
    }

    private function validarCorreoMeHasVisto(string $atributo, mixed $valor, \Closure $fail): void
    {
        if (!str_ends_with(mb_strtolower((string) $valor), '@mehasvisto.com')) {
            $fail('El correo debe terminar en @mehasvisto.com.');
        }
    }

    public function registro(Request $request): JsonResponse
    {
        $validador = Validator::make($request->all(), [
            'nombre_completo' => ['required', 'string', 'min:5', 'max:100'],
            'telefono' => ['required', 'digits:10'],
            'correo' => [
                'required',
                'email',
                'max:120',
                Rule::unique('users', 'email'),
                fn ($atributo, $valor, $fail) => $this->validarCorreoMeHasVisto($atributo, $valor, $fail),
            ],
            'password' => [...$this->reglasContrasena(), 'confirmed'],
            'mascota_favorita' => ['required', 'string', 'max:20', 'regex:/^\S+$/'],
        ], [
            'nombre_completo.required' => 'El nombre completo es obligatorio.',
            'nombre_completo.min' => 'Ingresa al menos nombre y apellido.',
            'telefono.required' => 'El teléfono es obligatorio.',
            'telefono.digits' => 'El teléfono debe tener 10 dígitos.',
            'correo.required' => 'El correo es obligatorio.',
            'correo.email' => 'Ingresa un correo válido.',
            'correo.unique' => 'Este correo ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener mínimo 8 caracteres.',
            'password.max' => 'La contraseña debe tener máximo 10 caracteres.',
            'password.regex' => 'La contraseña debe tener una mayúscula, una minúscula, un número y un carácter especial.',
            'password.confirmed' => 'La confirmación de contraseña no coincide.',
            'mascota_favorita.required' => 'La mascota favorita es obligatoria para recuperar la cuenta.',
            'mascota_favorita.regex' => 'La mascota favorita debe escribirse en una sola palabra.',
        ]);

        if ($validador->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validador->errors(),
            ], 422);
        }

        $usuario = User::create([
            'name' => trim($request->nombre_completo),
            'email' => mb_strtolower(trim($request->correo)),
            'telefono' => trim($request->telefono),
            'password' => $request->password,
            'rol' => 'usuario',
            'estado_cuenta' => 'activo',
            'foto_perfil' => null,
            'mascota_favorita_hash' => Hash::make($this->normalizarRespuesta($request->mascota_favorita)),
        ]);

        return response()->json([
            'message' => 'Cuenta creada correctamente. Ahora inicia sesión.',
            'usuario' => $this->formatoUsuario($usuario),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validador = Validator::make($request->all(), [
            'correo' => [
                'required',
                'email',
                fn ($atributo, $valor, $fail) => $this->validarCorreoMeHasVisto($atributo, $valor, $fail),
            ],
            'password' => ['required', 'string'],
        ], [
            'correo.required' => 'El correo es obligatorio.',
            'correo.email' => 'Ingresa un correo válido.',
            'password.required' => 'La contraseña es obligatoria.',
        ]);

        if ($validador->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validador->errors(),
            ], 422);
        }

        $usuario = User::where('email', mb_strtolower(trim($request->correo)))->first();

        if (!$usuario || !Hash::check($request->password, $usuario->password)) {
            return response()->json([
                'message' => 'Correo o contraseña incorrectos.',
            ], 401);
        }

        if (!$usuario->estaActivo()) {
            return response()->json([
                'message' => 'Tu cuenta fue inactivada por el administrador. No puedes iniciar sesión en este momento.',
            ], 403);
        }

        $usuario->tokens()->delete();
        $token = $usuario->createToken('me-has-visto-mobile')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión correcto.',
            'token' => $token,
            'tipoToken' => 'Bearer',
            'usuario' => $this->formatoUsuario($usuario),
        ]);
    }

    public function perfil(Request $request): JsonResponse
    {
        return response()->json([
            'usuario' => $this->formatoUsuario($request->user()),
        ]);
    }


    public function actualizarPerfil(Request $request): JsonResponse
    {
        $usuario = $request->user();

        $validador = Validator::make($request->all(), [
            'nombre_completo' => ['required', 'string', 'min:5', 'max:100'],
            'telefono' => ['required', 'digits:10'],
            'foto_perfil' => ['nullable', 'string', 'max:5000'],
        ], [
            'nombre_completo.required' => 'El nombre completo es obligatorio.',
            'nombre_completo.min' => 'Ingresa al menos nombre y apellido.',
            'telefono.required' => 'El teléfono es obligatorio.',
            'telefono.digits' => 'El teléfono debe tener 10 dígitos.',
        ]);

        if ($validador->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validador->errors(),
            ], 422);
        }

        $usuario->update([
            'name' => trim($request->nombre_completo),
            'telefono' => trim($request->telefono),
            'foto_perfil' => $request->foto_perfil,
        ]);

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'usuario' => $this->formatoUsuario($usuario->fresh()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }

    public function verificarRecuperacion(Request $request): JsonResponse
    {
        $validador = Validator::make($request->all(), [
            'correo' => ['required', 'email'],
            'mascota_favorita' => ['required', 'string', 'max:20', 'regex:/^\S+$/'],
        ]);

        if ($validador->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validador->errors(),
            ], 422);
        }

        $usuario = User::where('email', mb_strtolower(trim($request->correo)))->first();

        if (!$usuario || !$usuario->mascota_favorita_hash) {
            return response()->json([
                'message' => 'No se encontró una cuenta con esos datos.',
            ], 404);
        }

        if (!Hash::check($this->normalizarRespuesta($request->mascota_favorita), $usuario->mascota_favorita_hash)) {
            return response()->json([
                'message' => 'La respuesta de recuperación no coincide.',
            ], 401);
        }

        return response()->json([
            'message' => 'Datos verificados. Ahora puedes cambiar la contraseña.',
        ]);
    }

    public function restablecerContrasena(Request $request): JsonResponse
    {
        $validador = Validator::make($request->all(), [
            'correo' => ['required', 'email'],
            'mascota_favorita' => ['required', 'string', 'max:20', 'regex:/^\S+$/'],
            'password' => [...$this->reglasContrasena(), 'confirmed'],
        ], [
            'password.regex' => 'La contraseña debe tener una mayúscula, una minúscula, un número y un carácter especial.',
            'password.confirmed' => 'La confirmación de contraseña no coincide.',
        ]);

        if ($validador->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validador->errors(),
            ], 422);
        }

        $usuario = User::where('email', mb_strtolower(trim($request->correo)))->first();

        if (!$usuario || !$usuario->mascota_favorita_hash) {
            return response()->json([
                'message' => 'No se encontró una cuenta con esos datos.',
            ], 404);
        }

        if (!Hash::check($this->normalizarRespuesta($request->mascota_favorita), $usuario->mascota_favorita_hash)) {
            return response()->json([
                'message' => 'La respuesta de recuperación no coincide.',
            ], 401);
        }

        $usuario->update([
            'password' => $request->password,
        ]);

        $usuario->tokens()->delete();

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.',
        ]);
    }
}
