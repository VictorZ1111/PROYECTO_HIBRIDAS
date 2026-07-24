<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactoReporte extends Model
{
    use HasFactory;

    protected $table = 'contactos_reportes';

    protected $fillable = [
        'reporte_id',
        'user_id',
        'tipo_contacto',
    ];

    public function reporte(): BelongsTo
    {
        return $this->belongsTo(ReporteMascota::class, 'reporte_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
