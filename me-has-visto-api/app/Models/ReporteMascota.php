<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReporteMascota extends Model
{
    use HasFactory;

    protected $table = 'reportes_mascotas';

    protected $fillable = [
        'user_id',
        'nombre_mascota',
        'tipo_mascota',
        'estado',
        'raza',
        'color',
        'descripcion',
        'provincia',
        'ciudad',
        'sector',
        'telefono_contacto',
        'imagen',
        'latitud',
        'longitud',
        'estado_reporte',
        'observacion_admin',
        'fecha_observacion_admin',
        'fecha_encontrada',
    ];

    protected function casts(): array
    {
        return [
            'latitud' => 'decimal:7',
            'longitud' => 'decimal:7',
            'fecha_observacion_admin' => 'datetime',
            'fecha_encontrada' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function avistamientos(): HasMany
    {
        return $this->hasMany(Avistamiento::class, 'reporte_id');
    }

    public function contactos(): HasMany
    {
        return $this->hasMany(ContactoReporte::class, 'reporte_id');
    }
}
