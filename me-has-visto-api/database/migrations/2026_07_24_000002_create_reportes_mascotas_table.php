<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reportes_mascotas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('nombre_mascota', 100);
            $table->string('tipo_mascota', 60);
            $table->string('estado', 30)->default('perdida');
            $table->string('raza', 100)->nullable();
            $table->string('color', 100)->nullable();
            $table->text('descripcion')->nullable();
            $table->string('provincia', 100);
            $table->string('ciudad', 100);
            $table->string('sector', 150)->nullable();
            $table->string('telefono_contacto', 10);
            $table->longText('imagen')->nullable();
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            $table->string('estado_reporte', 40)->default('activo');
            $table->text('observacion_admin')->nullable();
            $table->timestamp('fecha_observacion_admin')->nullable();
            $table->timestamp('fecha_encontrada')->nullable();
            $table->timestamps();

            $table->index(['provincia', 'ciudad']);
            $table->index(['estado', 'estado_reporte']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes_mascotas');
    }
};
