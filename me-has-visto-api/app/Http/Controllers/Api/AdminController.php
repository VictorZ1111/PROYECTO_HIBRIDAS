<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReporteMascota;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    private function normalizarEstado(?string $estado): string
    {
        $estado = mb_strtolower(trim((string) $estado));
        return $estado === 'encontrada' ? 'encontrada' : 'perdida';
    }

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
            'totalReportes' => $usuario->reportes_count ?? $usuario->reportes()->count(),
            'totalAvistamientos' => $usuario->avistamientos_count ?? $usuario->avistamientos()->count(),
            'creadoEn' => optional($usuario->created_at)->toDateTimeString(),
        ];
    }

    private function formatoReporte(ReporteMascota $reporte): array
    {
        return [
            'id' => $reporte->id,
            'userId' => $reporte->user_id,
            'usuario' => $reporte->usuario ? $this->formatoUsuario($reporte->usuario) : null,
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

    public function panel(): JsonResponse
    {
        return response()->json([
            'message' => 'Acceso administrativo correcto.',
            'estadisticas' => [
                'usuarios' => User::where('rol', 'usuario')->count(),
                'usuariosActivos' => User::where('rol', 'usuario')->where('estado_cuenta', 'activo')->count(),
                'reportes' => ReporteMascota::count(),
                'reportesActivos' => ReporteMascota::where('estado_reporte', 'activo')->count(),
                'reportesEncontrados' => ReporteMascota::where('estado', 'encontrada')->count(),
                'reportesEliminadosAdmin' => ReporteMascota::where('estado_reporte', 'eliminado_admin')->count(),
            ],
        ]);
    }

    public function usuarios(Request $request): JsonResponse
    {
        $consulta = User::query()
            ->withCount(['reportes', 'avistamientos'])
            ->where('rol', 'usuario');

        if ($request->filled('estado_cuenta')) {
            $consulta->where('estado_cuenta', $request->input('estado_cuenta'));
        }

        if ($request->filled('buscar')) {
            $buscar = trim((string) $request->input('buscar'));
            $consulta->where(function ($subconsulta) use ($buscar) {
                $subconsulta
                    ->where('name', 'ILIKE', "%{$buscar}%")
                    ->orWhere('email', 'ILIKE', "%{$buscar}%")
                    ->orWhere('telefono', 'ILIKE', "%{$buscar}%");
            });
        }

        $usuarios = $consulta
            ->latest()
            ->get()
            ->map(fn (User $usuario) => $this->formatoUsuario($usuario));

        return response()->json([
            'usuarios' => $usuarios,
        ]);
    }

    public function cambiarEstadoUsuario(Request $request, User $usuario): JsonResponse
    {
        if ($usuario->rol === 'admin') {
            return response()->json([
                'message' => 'No se puede modificar el administrador del sistema desde esta pantalla.',
            ], 403);
        }

        $estado = $request->input('estado_cuenta', $request->input('estadoCuenta'));

        $validador = Validator::make(['estado_cuenta' => $estado], [
            'estado_cuenta' => ['required', Rule::in(['activo', 'inactivo'])],
        ], [
            'estado_cuenta.required' => 'El estado de la cuenta es obligatorio.',
            'estado_cuenta.in' => 'El estado debe ser activo o inactivo.',
        ]);

        if ($validador->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validador->errors(),
            ], 422);
        }

        $usuario->update([
            'estado_cuenta' => $estado,
        ]);

        if ($estado === 'inactivo') {
            $usuario->tokens()->delete();
        }

        $usuario->loadCount(['reportes', 'avistamientos']);

        return response()->json([
            'message' => 'Estado del usuario actualizado correctamente.',
            'usuario' => $this->formatoUsuario($usuario),
        ]);
    }

    public function eliminarUsuario(User $usuario): JsonResponse
    {
        if ($usuario->rol === 'admin') {
            return response()->json([
                'message' => 'No se puede eliminar el administrador del sistema.',
            ], 403);
        }

        $resumenUsuario = [
            'id' => $usuario->id,
            'nombreCompleto' => $usuario->name,
            'correo' => $usuario->email,
        ];

        $totalReportes = $usuario->reportes()->count();
        $totalAvistamientos = $usuario->avistamientos()->count();

        $usuario->tokens()->delete();
        $usuario->delete();

        return response()->json([
            'message' => 'Usuario y reportes asociados eliminados correctamente.',
            'usuarioEliminado' => $resumenUsuario,
            'reportesEliminados' => $totalReportes,
            'avistamientosEliminados' => $totalAvistamientos,
        ]);
    }

    public function reportes(Request $request): JsonResponse
    {
        $consulta = ReporteMascota::query()
            ->with('usuario')
            ->withCount(['avistamientos', 'contactos']);

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

        if ($request->filled('buscar')) {
            $buscar = trim((string) $request->input('buscar'));
            $consulta->where(function ($subconsulta) use ($buscar) {
                $subconsulta
                    ->where('nombre_mascota', 'ILIKE', "%{$buscar}%")
                    ->orWhere('tipo_mascota', 'ILIKE', "%{$buscar}%")
                    ->orWhere('provincia', 'ILIKE', "%{$buscar}%")
                    ->orWhere('ciudad', 'ILIKE', "%{$buscar}%");
            });
        }

        $reportes = $consulta
            ->latest()
            ->get()
            ->map(fn (ReporteMascota $reporte) => $this->formatoReporte($reporte));

        return response()->json([
            'reportes' => $reportes,
        ]);
    }

    public function eliminarReporte(Request $request, ReporteMascota $reporte): JsonResponse
    {
        $observacion = $request->input('observacion_admin', $request->input('observacion'));

        $validador = Validator::make(['observacion_admin' => $observacion], [
            'observacion_admin' => ['required', 'string', 'min:3', 'max:1000'],
        ], [
            'observacion_admin.required' => 'La observación es obligatoria.',
            'observacion_admin.min' => 'La observación debe tener al menos 3 caracteres.',
        ]);

        if ($validador->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validador->errors(),
            ], 422);
        }

        $reporte->update([
            'estado_reporte' => 'eliminado_admin',
            'observacion_admin' => trim((string) $observacion),
            'fecha_observacion_admin' => now(),
        ]);

        $reporte->load('usuario')->loadCount(['avistamientos', 'contactos']);

        return response()->json([
            'message' => 'Reporte eliminado por administración correctamente.',
            'reporte' => $this->formatoReporte($reporte),
        ]);
    }
}
