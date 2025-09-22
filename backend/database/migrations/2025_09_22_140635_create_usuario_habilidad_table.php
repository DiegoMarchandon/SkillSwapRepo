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
        Schema::create('usuario_habilidad', function (Blueprint $table) {
            //
           $table->id();
           $table->foreignId('user_id')->constrained()->onDelete('cascade');
           $table->foreignId('habilidad_id')->constrained('habilidad')->onDelete('cascade');
           $table->timestamps();
           $table->enum('tipo',['ofrecida','deseada'])->nullable();
           $table->enum('nivel',['principiante','intermedio','avanzado'])->nullable();
           $table->enum('estado',['activa','inactiva'])->default('activa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuario_habilidad', function (Blueprint $table) {
            //
            $table->dropColumn(['id', 'user_id', 'habilidad_id', 'created_at', 'updated_at', 'tipo', 'nivel', 'estado']);
        });
    }
};
