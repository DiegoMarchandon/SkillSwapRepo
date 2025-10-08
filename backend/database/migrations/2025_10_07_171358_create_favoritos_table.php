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
        Schema::create('favoritos', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('profesor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('usuario_habilidad_id')->constrained('usuario_habilidad')->onDelete('cascade');
            $table->foreignId('reseña_id')->constrained('reseñas')->onDelete('cascade'); //reseña que motivó el favorito
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favoritos');
    }
};
