<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('avistamientos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporte_id')->constrained('reportes_mascotas')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('observacion');
            $table->string('telefono', 10);
            $table->longText('imagen')->nullable();
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            $table->timestamps();

            $table->index(['reporte_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avistamientos');
    }
};
