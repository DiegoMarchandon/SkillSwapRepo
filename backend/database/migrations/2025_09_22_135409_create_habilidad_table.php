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
        Schema::create('habilidad', function (Blueprint $table) {
            //Creo las columnas
            $table->id(); //equivale a INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
            $table->string('nombre',120);
            $table->text('descripcion')->nullable();
            $table->timestamps(); //crea created_at y updatedat tipo DATETIME
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('habilidad', function (Blueprint $table) {
            //
            $table->dropColumn(['id', 'nombre', 'descripcion', 'created_at', 'updated_at']);
        });
    }
};
