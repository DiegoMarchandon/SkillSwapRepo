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
        Schema::create('sesion', function (Blueprint $table) {
            //
            $table->id();
            $table->foreignId('solicitud_id')->constrained('solicitud')->onDelete('cascade');
            $table->timestamps();
            $table->dateTime('inicio');
            $table->dateTime('fin');
            $table->unsignedInteger('duracion_min')->nullable(); //duración real
            $table->unsignedInteger('monto_creditos')->default(0);
            $table->enum('estado', ['programada', 'completada', 'cancelada','interrumpida'])->default('programada');
            $table->text('motivo_cancelacion')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sesion', function (Blueprint $table) {
            //
            $table->dropColumn(['id', 'solicitud_id', 'created_at', 'updated_at', 'inicio', 'fin', 'duracion_min', 'monto_creditos', 'estado', 'motivo_cancelacion']);
        });
    }
};
