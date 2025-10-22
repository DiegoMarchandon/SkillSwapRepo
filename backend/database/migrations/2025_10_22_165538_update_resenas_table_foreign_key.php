<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('reseñas', function (Blueprint $table) {
            // Eliminar la foreign key existente
            $table->dropForeign(['sesion_id']);
            
            // Renombrar la columna sesion_id a reserva_id
            $table->renameColumn('sesion_id', 'reserva_id');
            
            // Agregar nueva foreign key que apunte a reservas
            $table->foreign('reserva_id')->references('id')->on('reservas')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('reseñas', function (Blueprint $table) {
            $table->dropForeign(['reserva_id']);
            $table->renameColumn('reserva_id', 'sesion_id');
            $table->foreign('sesion_id')->references('id')->on('sesion')->onDelete('cascade');
        });
    }
};
