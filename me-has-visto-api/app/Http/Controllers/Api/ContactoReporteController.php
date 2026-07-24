<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactoReporte;
use App\Models\ReporteMascota;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ContactoReporteController extends Controller
{
    public function store(Request $request, ReporteMascota $reporte): JsonResponse
    {
        if ($request->user()->rol === 'admin') {
            return response()->json([
                'message' => 'El administrador no registra contactos de reportes.',
            ], 403);
        }

        if ($reporte->user_id === $request->user()->id) {
            return response()->json([
                'message' => 'No puedes contactar tu propio reporte.',
            ], 403);
        }

        if (!in_array($reporte->estado_reporte, ['activo'], true) || $reporte->estado !== 'perdida') {
            return response()->json([
                'message' => 'Este reporte ya no acepta contactos.',
            ], 403);
        }

        $validador = Validator::make($request->all(), [
            'tipo_contacto' => ['required_without:tipoContacto', Rule::in(['whatsapp', 'llamada'])],
            'tipoContacto' => ['required_without:tipo_contacto', Rule::in(['whatsapp', 'llamada'])],
        ], [
            'tipo_contacto.required_without' => 'El tipo de contacto es obligatorio.',
            'tipoContacto.required_without' => 'El tipo de contacto es obligatorio.',
        ]);

        if ($validador->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors' => $validador->errors(),
            ], 422);
        }

        $contacto = ContactoReporte::create([
            'reporte_id' => $reporte->id,
            'user_id' => $request->user()->id,
            'tipo_contacto' => $request->input('tipo_contacto', $request->input('tipoContacto')),
        ]);

        return response()->json([
            'message' => 'Contacto registrado correctamente.',
            'contacto' => [
                'id' => $contacto->id,
                'reporteId' => $contacto->reporte_id,
                'userId' => $contacto->user_id,
                'tipoContacto' => $contacto->tipo_contacto,
                'creadoEn' => optional($contacto->created_at)->toDateTimeString(),
            ],
        ], 201);
    }
}
