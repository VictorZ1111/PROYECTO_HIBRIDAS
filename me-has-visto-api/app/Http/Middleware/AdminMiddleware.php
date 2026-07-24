<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->user();

        if (!$usuario || $usuario->rol !== 'admin') {
            return response()->json([
                'message' => 'No tienes permisos para realizar esta acción.',
            ], 403);
        }

        if (($usuario->estado_cuenta ?? 'activo') !== 'activo') {
            return response()->json([
                'message' => 'Tu cuenta administrativa no se encuentra activa.',
            ], 403);
        }

        return $next($request);
    }
}
