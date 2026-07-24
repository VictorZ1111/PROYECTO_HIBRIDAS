<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'telefono')) {
                $table->string('telefono', 10)->nullable()->after('email');
            }

            if (!Schema::hasColumn('users', 'rol')) {
                $table->string('rol')->default('usuario')->after('password');
            }

            if (!Schema::hasColumn('users', 'foto_perfil')) {
                $table->text('foto_perfil')->nullable()->after('rol');
            }

            if (!Schema::hasColumn('users', 'estado_cuenta')) {
                $table->string('estado_cuenta')->default('activo')->after('foto_perfil');
            }

            if (!Schema::hasColumn('users', 'mascota_favorita_hash')) {
                $table->string('mascota_favorita_hash')->nullable()->after('estado_cuenta');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columnas = [
                'telefono',
                'rol',
                'foto_perfil',
                'estado_cuenta',
                'mascota_favorita_hash',
            ];

            foreach ($columnas as $columna) {
                if (Schema::hasColumn('users', $columna)) {
                    $table->dropColumn($columna);
                }
            }
        });
    }
};
