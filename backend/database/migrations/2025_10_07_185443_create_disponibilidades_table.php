<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('disponibilidades', function (Blueprint $t) {
            $t->id();
            $t->foreignId('instructor_id')->constrained('users')->cascadeOnDelete();
            $t->dateTime('inicio_utc');
            $t->dateTime('fin_utc');
            $t->enum('estado', ['libre', 'tomada', 'cancelada', 'expirada'])->default('libre');
            $t->string('nota', 120)->nullable();
            $t->timestamps();

            // Evita slots duplicados para el mismo instructor y rango exacto
            $t->unique(['instructor_id', 'inicio_utc', 'fin_utc']);
            // Índice útil para consultas por calendario
            $t->index(['instructor_id', 'inicio_utc']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disponibilidades');
    }
};
