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
        Schema::create('reseñas', function (Blueprint $table) {
            //
            $table->id();
            $table->foreignId('sesion_id')->constrained('sesion')->onDelete('cascade');
            $table->foreignId('emisor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('receptor_id')->constrained('users')->onDelete('cascade');
            $table->tinyInteger('rating')->unsigned();
            $table->text('comentario')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reseñas', function (Blueprint $table) {
            //
            $table->dropColumn(['id', 'sesion_id', 'emisor_id', 'receptor_id', 'rating', 'comentario', 'created_at', 'updated_at']);
        });
    }
};
