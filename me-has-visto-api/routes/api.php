<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AvistamientoController;
use App\Http\Controllers\Api\ContactoReporteController;
use App\Http\Controllers\Api\ReporteMascotaController;
use Illuminate\Support\Facades\Route;

Route::post('/registro', [AuthController::class, 'registro']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/recuperacion/verificar', [AuthController::class, 'verificarRecuperacion']);
Route::post('/recuperacion/restablecer', [AuthController::class, 'restablecerContrasena']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/perfil', [AuthController::class, 'perfil']);
    Route::put('/perfil', [AuthController::class, 'actualizarPerfil']);
    Route::patch('/perfil', [AuthController::class, 'actualizarPerfil']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/reportes', [ReporteMascotaController::class, 'index']);
    Route::post('/reportes', [ReporteMascotaController::class, 'store']);
    Route::get('/reportes/{reporte}', [ReporteMascotaController::class, 'show']);
    Route::put('/reportes/{reporte}', [ReporteMascotaController::class, 'update']);
    Route::delete('/reportes/{reporte}', [ReporteMascotaController::class, 'destroy']);
    Route::patch('/reportes/{reporte}/encontrada', [ReporteMascotaController::class, 'marcarEncontrada']);

    Route::get('/mis-reportes', [ReporteMascotaController::class, 'misReportes']);

    Route::post('/reportes/{reporte}/avistamientos', [AvistamientoController::class, 'store']);
    Route::get('/reportes/{reporte}/avistamientos', [AvistamientoController::class, 'porReporte']);
    Route::get('/mis-avistamientos/enviados', [AvistamientoController::class, 'enviados']);
    Route::get('/mis-avistamientos/recibidos', [AvistamientoController::class, 'recibidos']);

    Route::post('/reportes/{reporte}/contactos', [ContactoReporteController::class, 'store']);

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/panel', [AdminController::class, 'panel']);
        Route::get('/usuarios', [AdminController::class, 'usuarios']);
        Route::patch('/usuarios/{usuario}/estado', [AdminController::class, 'cambiarEstadoUsuario']);
        Route::delete('/usuarios/{usuario}', [AdminController::class, 'eliminarUsuario']);
        Route::get('/reportes', [AdminController::class, 'reportes']);
        Route::patch('/reportes/{reporte}/eliminar', [AdminController::class, 'eliminarReporte']);
    });
});
