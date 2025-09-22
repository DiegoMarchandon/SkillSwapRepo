<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('solicitud', function (Blueprint $table) {
            //
            $table->id();
            $table->foreignId('solicitante_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('ofertante_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('usuario_habilidad_id')->constrained('usuario_habilidad')->onDelete('cascade');
            $table->timestamps();
            $table->text('mensaje_inicial')->nullable(); //mensaje opcional acompañado de la solicitud
            $table->enum('estado', ['pendiente', 'aceptada', 'rechazada','expirada', 'cancelada'])->default('pendiente');
            $table->dateTime('propuesta_inicio')->nullable();
            $table->unsignedInteger('propuesta_duracion_min')->nullable(); //duración estimada previamente
        }); 
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitud', function (Blueprint $table) {
            //
            $table->dropColumn(['id', 'solicitante_id', 'ofertante_id', 'usuario_habilidad_id', 'created_at', 'updated_at', 'mensaje_inicial', 'estado', 'propuesta_inicio', 'propuesta_duracion_min']);
        });
    }
};
