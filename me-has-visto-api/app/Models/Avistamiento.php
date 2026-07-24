<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Avistamiento extends Model
{
    use HasFactory;

    protected $fillable = [
        'reporte_id',
        'user_id',
        'observacion',
        'telefono',
        'imagen',
        'latitud',
        'longitud',
    ];

    protected function casts(): array
    {
        return [
            'latitud' => 'decimal:7',
            'longitud' => 'decimal:7',
        ];
    }

    public function reporte(): BelongsTo
    {
        return $this->belongsTo(ReporteMascota::class, 'reporte_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
