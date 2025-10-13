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
        Schema::table('calls', function (Blueprint $table) {
            $table->foreignId('usuario_habilidad_id')->nullable()->constrained('usuario_habilidad')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('calls', function (Blueprint $table) {
            $table->dropForeign(['usuario_habilidad_id']); // Elimina la clave foránea
            $table->dropColumn('usuario_habilidad_id');    // Elimina la columna
        });
    }
};
