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
        Schema::table('favoritos', function (Blueprint $table) {
            $table->dropForeign(['reseña_id']); // si tenía clave foránea
            $table->dropColumn('reseña_id');
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('favoritos', function (Blueprint $table) {
            $table->unsignedBigInteger('reseña_id')->nullable();
            $table->foreign('reseña_id')->references('id')->on('reseñas');
        });
    }
};
