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
        Schema::create('mensajes', function (Blueprint $table) {
            //
            $table->id();
            $table->foreignId('solicitud_id')->constrained('solicitud')->onDelete('cascade');
            $table->foreignId('emisor_id')->constrained('users')->onDelete('cascade');    
            $table->timestamps();
            $table->text('contenido');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mensajes', function (Blueprint $table) {
            //
            $table->dropColumn(['id', 'solicitud_id', 'emisor_id', 'created_at', 'updated_at', 'contenido']);
        });
    }
};
