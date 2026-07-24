<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReporteMascota;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ReporteMascotaController extends Controller
{
    private function valor(Request $request, array $nombres, mixed $defecto = null): mixed
    {
        foreach ($nombres as $nombre) {
            if ($request->has($nombre)) {
                return $request->input($nombre);
            }
        }

        return $defecto;
    }

    private function texto(?string $valor): ?string
    {
        $valor = trim((string) $valor);
        return $valor === '' ? null : $valor;
    }

    private function normalizarEstado(?string $estado): string
    {
        $estado = mb_strtolower(trim((string) $estado));
        return $estado === 'encontrada' ? 'encontrada' : 'perdida';
    }

    private function formatoUsuario($usuario): ?array
    {
        if (!$usuario) {
            return null;
        }

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

    private function formatoReporte(ReporteMascota $reporte): array
    {
        return [
            'id' => $reporte->id,
            'userId' => $reporte->user_id,
            'usuario' => $this->formatoUsuario($reporte->usuario),
            'nombreMascota' => $reporte->nombre_mascota,
            'tipoMascota' => $reporte->tipo_mascota,
            'estado' => ucfirst($reporte->estado),
            'raza' => $reporte->raza,
            'color' => $reporte->color,
            'descripcion' => $reporte->descripcion,
            'provincia' => $reporte->provincia,
            'ciudad' => $reporte->ciudad,
            'sector' => $reporte->sector,
            'telefonoContacto' => $reporte->telefono_contacto,
            'imagen' => $reporte->imagen,
            'latitud' => $reporte->latitud !== null ? (float) $reporte->latitud : null,
            'longitud' => $reporte->longitud !== null ? (float) $reporte->longitud : null,
            'estadoReporte' => $reporte->estado_reporte,
            'observacionAdmin' => $reporte->observacion_admin,
            'fechaObservacionAdmin' => optional($reporte->fecha_observacion_admin)->toDateTimeString(),
            'fechaEncontrada' => optional($reporte->fecha_encontrada)->toDateTimeString(),
            'totalAvistamientos' => $reporte->avistamientos_count ?? $reporte->avistamientos()->count(),
            'totalContactos' => $reporte->contactos_count ?? $reporte->contactos()->count(),
            'creadoEn' => optional($reporte->created_at)->toDateTimeString(),
            'actualizadoEn' => optional($reporte->updated_at)->toDateTimeString(),
        ];
    }

    private function puedeVer(Request $request, ReporteMascota $reporte): bool
    {
        $usuario = $request->user();

        if ($usuario->rol === 'admin') {
            return true;
        }

        if ($reporte->user_id === $usuario->id) {
            return true;
        }

        return in_array($reporte->estado_reporte, ['activo', 'resuelto'], true);
    }

    private function validarDueño(Request $request, ReporteMascota $reporte): ?JsonResponse
    {
        if ($request->user()->rol === 'admin') {
            return response()->json([
                'message' => 'El administrador no debe modificar reportes como usuario. Usa las rutas administrativas.',
            ], 403);
        }

        if ($reporte->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Solo puedes modificar tus propios reportes.',
            ], 403);
        }

        if ($reporte->estado_reporte === 'eliminado_admin') {
            return response()->json([
                'message' => 'Este reporte fue eliminado por administración y ya no puede modificarse.',
            ], 403);
        }

        return null;
    }

    public function index(Request $request): JsonResponse
    {
        $consulta = ReporteMascota::query()
            ->with('usuario')
            ->withCount(['avistamientos', 'contactos']);

        if ($request->user()->rol !== 'admin') {
            $consulta->whereIn('estado_reporte', ['activo', 'resuelto']);
        }

        if ($request->filled('provincia')) {
            $consulta->where('provincia', $request->input('provincia'));
        }

        if ($request->filled('ciudad')) {
            $consulta->where('ciudad', $request->input('ciudad'));
        }

        if ($request->filled('estado')) {
            $consulta->where('estado', $this->normalizarEstado($request->input('estado')));
        }

        if ($request->filled('estado_reporte')) {
            $consulta->where('estado_reporte', $request->input('estado_reporte'));
        }

        $reportes = $consulta
            ->latest()
            ->get()
            ->map(fn (ReporteMascota $reporte) => $this->formatoReporte($reporte));

        return response()->json([
            'reportes' => $reportes,
        ]);
    }

    public function misReportes(Request $request): JsonResponse
    {
        $reportes = ReporteMascota::query()
            ->with('usuario')
            ->withCount(['avistamientos', 'contactos'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (ReporteMascota $reporte) => $this->formatoReporte($reporte));

        return response()->json([
            'reportes' => $reportes,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->user()->rol === 'admin') {
            return response()->json([
                'message' => 'El administrador no crea reportes de mascotas.',
            ], 403);
        }

        $datos = [
            'nombre_mascota' => $this->valor($request, ['nombre_mascota', 'nombreMascota', 'nombre']),
            'tipo_mascota' => $this->valor($request, ['tipo_mascota', 'tipoMascota', 'tipo']),
            'estado' => $this->normalizarEstado($this->valor($request, ['estado'], 'perdida')),
            'raza' => $this->valor($request, ['raza']),
            'color' => $this->valor($request, ['color']),
            'descripcion' => $this->valor($request, ['descripcion', 'descripcionMascota']),
            'provincia' => $this->valor($request, ['provincia']),
            'ciudad' => $this->valor($request, ['ciudad']),
            'sector' => $this->valor($request, ['sector', 'ubicacionTexto']),
            'telefono_contacto' => $this->valor($request, ['telefono_contacto', 'telefonoContacto', 'telefono'], $request->user()->telefono),
            'imagen' => $this->valor($request, ['imagen', 'foto', 'fotoMascota']),
            'latitud' => $this->valor($request, ['latitud', 'latitude']),
            'longitud' => $this->valor($request, ['longitud', 'longitude']),
        ];

        $validador = Validator::make($datos, [
            'nombre_mascota' => ['required', 'string', 'max:100'],
            'tipo_mascota' => ['required', 'string', 'max:60'],
            'estado' => ['required', Rule::in(['perdida', 'encontrada'])],
            'raza' => ['nullable', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:100'],
            'descripcion' => ['nullable', 'string', 'max:1000'],
            'provincia' => ['required', 'string', 'max:100'],
            'ciudad' => ['required', 'string', 'max:100'],
            'sector' => ['nullable', 'string', 'max:150'],
            'telefono_contacto' => ['required', 'digits:10'],
            'imagen' => ['nullable', 'string'],
            'latitud' => ['nullable', 'numeric', 'between:-90,90'],
            'longitud' => ['nullable', 'numeric', 'between:-180,180'],
        ], [
            'nombre_mascota.required' => 'El nombre de la mascota es obligatorio.',
            'tipo_mascota.required' => 'El tipo de mascota es obligatorio.',
            'provincia.required' => 'La provincia es obligatoria.',
            'ciudad.required' => 'La ciudad es obligatoria.',
            'telefono_contacto.digits' => 'El teléfono de contacto debe tener 10 dígitos.',
        ]);

        if ($validador->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validador->errors(),
            ], 422);
        }

        $reporte = ReporteMascota::create([
            ...$datos,
            'user_id' => $request->user()->id,
            'estado_reporte' => $datos['estado'] === 'encontrada' ? 'resuelto' : 'activo',
            'fecha_encontrada' => $datos['estado'] === 'encontrada' ? now() : null,
        ])->load('usuario');

        return response()->json([
            'message' => 'Reporte creado correctamente.',
            'reporte' => $this->formatoReporte($reporte),
        ], 201);
    }

    public function show(Request $request, ReporteMascota $reporte): JsonResponse
    {
        $reporte->load('usuario')->loadCount(['avistamientos', 'contactos']);

        if (!$this->puedeVer($request, $reporte)) {
            return response()->json([
                'message' => 'No se encontró el reporte solicitado.',
            ], 404);
        }

        return response()->json([
            'reporte' => $this->formatoReporte($reporte),
        ]);
    }

    public function update(Request $request, ReporteMascota $reporte): JsonResponse
    {
        if ($respuesta = $this->validarDueño($request, $reporte)) {
            return $respuesta;
        }

        $datos = [];
        $mapa = [
            'nombre_mascota' => ['nombre_mascota', 'nombreMascota', 'nombre'],
            'tipo_mascota' => ['tipo_mascota', 'tipoMascota', 'tipo'],
            'estado' => ['estado'],
            'raza' => ['raza'],
            'color' => ['color'],
            'descripcion' => ['descripcion', 'descripcionMascota'],
            'provincia' => ['provincia'],
            'ciudad' => ['ciudad'],
            'sector' => ['sector', 'ubicacionTexto'],
            'telefono_contacto' => ['telefono_contacto', 'telefonoContacto', 'telefono'],
            'imagen' => ['imagen', 'foto', 'fotoMascota'],
            'latitud' => ['latitud', 'latitude'],
            'longitud' => ['longitud', 'longitude'],
        ];

        foreach ($mapa as $campo => $nombres) {
            foreach ($nombres as $nombre) {
                if ($request->has($nombre)) {
                    $datos[$campo] = $request->input($nombre);
                    break;
                }
            }
        }

        if (array_key_exists('estado', $datos)) {
            $datos['estado'] = $this->normalizarEstado($datos['estado']);
        }

        $validador = Validator::make($datos, [
            'nombre_mascota' => ['sometimes', 'required', 'string', 'max:100'],
            'tipo_mascota' => ['sometimes', 'required', 'string', 'max:60'],
            'estado' => ['sometimes', 'required', Rule::in(['perdida', 'encontrada'])],
            'raza' => ['nullable', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:100'],
            'descripcion' => ['nullable', 'string', 'max:1000'],
            'provincia' => ['sometimes', 'required', 'string', 'max:100'],
            'ciudad' => ['sometimes', 'required', 'string', 'max:100'],
            'sector' => ['nullable', 'string', 'max:150'],
            'telefono_contacto' => ['sometimes', 'required', 'digits:10'],
            'imagen' => ['nullable', 'string'],
            'latitud' => ['nullable', 'numeric', 'between:-90,90'],
            'longitud' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        if ($validador->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validador->errors(),
            ], 422);
        }

        if (($datos['estado'] ?? null) === 'encontrada') {
            $datos['estado_reporte'] = 'resuelto';
            $datos['fecha_encontrada'] = now();
        } elseif (($datos['estado'] ?? null) === 'perdida') {
            $datos['estado_reporte'] = 'activo';
            $datos['fecha_encontrada'] = null;
        }

        $reporte->update($datos);
        $reporte->load('usuario')->loadCount(['avistamientos', 'contactos']);

        return response()->json([
            'message' => 'Reporte actualizado correctamente.',
            'reporte' => $this->formatoReporte($reporte),
        ]);
    }

    public function destroy(Request $request, ReporteMascota $reporte): JsonResponse
    {
        if ($respuesta = $this->validarDueño($request, $reporte)) {
            return $respuesta;
        }

        $reporte->update([
            'estado_reporte' => 'eliminado_usuario',
        ]);

        return response()->json([
            'message' => 'Reporte eliminado correctamente.',
        ]);
    }

    public function marcarEncontrada(Request $request, ReporteMascota $reporte): JsonResponse
    {
        if ($respuesta = $this->validarDueño($request, $reporte)) {
            return $respuesta;
        }

        $reporte->update([
            'estado' => 'encontrada',
            'estado_reporte' => 'resuelto',
            'fecha_encontrada' => now(),
        ]);

        $reporte->load('usuario')->loadCount(['avistamientos', 'contactos']);

        return response()->json([
            'message' => 'Reporte marcado como encontrado.',
            'reporte' => $this->formatoReporte($reporte),
        ]);
    }
}
