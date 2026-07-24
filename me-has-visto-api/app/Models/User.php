<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'telefono',
        'rol',
        'foto_perfil',
        'estado_cuenta',
        'mascota_favorita_hash',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'mascota_favorita_hash',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function reportes(): HasMany
    {
        return $this->hasMany(ReporteMascota::class);
    }

    public function avistamientos(): HasMany
    {
        return $this->hasMany(Avistamiento::class);
    }

    public function contactosReportes(): HasMany
    {
        return $this->hasMany(ContactoReporte::class);
    }

    public function esAdmin(): bool
    {
        return $this->rol === 'admin';
    }

    public function estaActivo(): bool
    {
        return ($this->estado_cuenta ?? 'activo') === 'activo';
    }
}
