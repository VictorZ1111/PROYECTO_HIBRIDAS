<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Avistamiento;
use App\Models\ReporteMascota;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AvistamientoController extends Controller
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
            'nombreMascota' => $reporte->nombre_mascota,
            'tipoMascota' => $reporte->tipo_mascota,
            'estado' => ucfirst($reporte->estado),
            'provincia' => $reporte->provincia,
            'ciudad' => $reporte->ciudad,
            'sector' => $reporte->sector,
            'imagen' => $reporte->imagen,
            'estadoReporte' => $reporte->estado_reporte,
            'observacionAdmin' => $reporte->observacion_admin,
        ];
    }

    private function formatoAvistamiento(Avistamiento $avistamiento): array
    {
        return [
            'id' => $avistamiento->id,
            'reporteId' => $avistamiento->reporte_id,
            'userId' => $avistamiento->user_id,
            'usuario' => $this->formatoUsuario($avistamiento->usuario),
            'reporte' => $avistamiento->reporte ? $this->formatoReporte($avistamiento->reporte) : null,
            'observacion' => $avistamiento->observacion,
            'telefono' => $avistamiento->telefono,
            'imagen' => $avistamiento->imagen,
            'latitud' => $avistamiento->latitud !== null ? (float) $avistamiento->latitud : null,
            'longitud' => $avistamiento->longitud !== null ? (float) $avistamiento->longitud : null,
            'creadoEn' => optional($avistamiento->created_at)->toDateTimeString(),
        ];
    }

    private function reporteVisibleParaUsuario(Request $request, ReporteMascota $reporte): bool
    {
        if ($request->user()->rol === 'admin') {
            return true;
        }

        if ($reporte->user_id === $request->user()->id) {
            return true;
        }

        return in_array($reporte->estado_reporte, ['activo', 'resuelto'], true);
    }

    public function store(Request $request, ReporteMascota $reporte): JsonResponse
    {
        if ($request->user()->rol === 'admin') {
            return response()->json([
                'message' => 'El administrador no registra avistamientos.',
            ], 403);
        }

        if ($reporte->user_id === $request->user()->id) {
            return response()->json([
                'message' => 'No puedes registrar avistamientos en tu propio reporte.',
            ], 403);
        }

        if (!in_array($reporte->estado_reporte, ['activo'], true) || $reporte->estado !== 'perdida') {
            return response()->json([
                'message' => 'Este reporte ya no acepta avistamientos.',
            ], 403);
        }

        $datos = [
            'observacion' => $this->valor($request, ['observacion', 'comentario', 'descripcion']),
            'telefono' => $this->valor($request, ['telefono'], $request->user()->telefono),
            'imagen' => $this->valor($request, ['imagen', 'foto']),
            'latitud' => $this->valor($request, ['latitud', 'latitude']),
            'longitud' => $this->valor($request, ['longitud', 'longitude']),
        ];

        $validador = Validator::make($datos, [
            'observacion' => ['required', 'string', 'max:1000'],
            'telefono' => ['required', 'digits:10'],
            'imagen' => ['nullable', 'string'],
            'latitud' => ['nullable', 'numeric', 'between:-90,90'],
            'longitud' => ['nullable', 'numeric', 'between:-180,180'],
        ], [
            'observacion.required' => 'La observación es obligatoria.',
            'telefono.digits' => 'El teléfono debe tener 10 dígitos.',
        ]);

        if ($validador->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validador->errors(),
            ], 422);
        }

        $avistamiento = Avistamiento::create([
            ...$datos,
            'reporte_id' => $reporte->id,
            'user_id' => $request->user()->id,
        ])->load(['usuario', 'reporte']);

        return response()->json([
            'message' => 'Avistamiento registrado correctamente.',
            'avistamiento' => $this->formatoAvistamiento($avistamiento),
        ], 201);
    }

    public function porReporte(Request $request, ReporteMascota $reporte): JsonResponse
    {
        if (!$this->reporteVisibleParaUsuario($request, $reporte)) {
            return response()->json([
                'message' => 'No se encontró el reporte solicitado.',
            ], 404);
        }

        if ($request->user()->rol !== 'admin' && $reporte->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Solo el dueño del reporte puede ver los avistamientos recibidos.',
            ], 403);
        }

        $avistamientos = Avistamiento::query()
            ->with(['usuario', 'reporte'])
            ->where('reporte_id', $reporte->id)
            ->latest()
            ->get()
            ->map(fn (Avistamiento $avistamiento) => $this->formatoAvistamiento($avistamiento));

        return response()->json([
            'avistamientos' => $avistamientos,
        ]);
    }

    public function enviados(Request $request): JsonResponse
    {
        $avistamientos = Avistamiento::query()
            ->with(['usuario', 'reporte'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (Avistamiento $avistamiento) => $this->formatoAvistamiento($avistamiento));

        return response()->json([
            'avistamientos' => $avistamientos,
        ]);
    }

    public function recibidos(Request $request): JsonResponse
    {
        $avistamientos = Avistamiento::query()
            ->with(['usuario', 'reporte'])
            ->whereHas('reporte', function ($consulta) use ($request) {
                $consulta->where('user_id', $request->user()->id);
            })
            ->latest()
            ->get()
            ->map(fn (Avistamiento $avistamiento) => $this->formatoAvistamiento($avistamiento));

        return response()->json([
            'avistamientos' => $avistamientos,
        ]);
    }
}
