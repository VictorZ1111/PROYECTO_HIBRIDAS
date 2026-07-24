<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contactos_reportes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporte_id')->constrained('reportes_mascotas')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('tipo_contacto', 30);
            $table->timestamps();

            $table->index(['reporte_id', 'user_id', 'tipo_contacto']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contactos_reportes');
    }
};
