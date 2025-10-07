<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $t) {
            $t->id();
            $t->foreignId('disponibilidad_id')->constrained('disponibilidades')->cascadeOnDelete();
            $t->foreignId('instructor_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('alumno_id')->constrained('users')->cascadeOnDelete();
            $t->enum('estado', ['pendiente', 'confirmada', 'en_curso', 'finalizada', 'cancelada', 'interrumpida', 'no_asistio'])->default('confirmada');
            $t->string('enlace_reunion')->nullable();
            $t->dateTime('inicio_real_utc')->nullable();
            $t->dateTime('fin_real_utc')->nullable();
            $t->unsignedInteger('duracion_real_min')->nullable();
            $t->unsignedInteger('creditos_cobrados')->nullable();
            $t->timestamps();
            $t->unique('disponibilidad_id'); // 1 reserva por slot
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
