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
        Schema::table('call_metrics', function (Blueprint $table) {
            // Primero eliminamos el campo viejo si era string
            $table->dropColumn('call_id');

            // Luego creamos una relación correcta con la tabla calls
            $table->unsignedBigInteger('call_id');
            $table->foreign('call_id')->references('id')->on('calls')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('call_metrics', function (Blueprint $table) {
            //
            $table->dropForeign(['call_id']);
            $table->dropColumn('call_id');
            $table->string('call_id'); // volvemos al estado anterior
        });
    }
};
