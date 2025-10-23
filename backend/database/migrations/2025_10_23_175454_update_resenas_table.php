<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('resenas', function (Blueprint $t) {
            if (!Schema::hasColumn('resenas', 'reserva_id'))  $t->unsignedBigInteger('reserva_id')->index();
            if (!Schema::hasColumn('resenas', 'emisor_id'))   $t->unsignedBigInteger('emisor_id')->index();
            if (!Schema::hasColumn('resenas', 'receptor_id')) $t->unsignedBigInteger('receptor_id')->index();
            if (!Schema::hasColumn('resenas', 'rating'))      $t->unsignedTinyInteger('rating');
            if (!Schema::hasColumn('resenas', 'comentario'))  $t->text('comentario')->nullable();

            // FKs (si aún no existen)
            $t->foreign('reserva_id')->references('id')->on('reservas')->cascadeOnDelete();
            $t->foreign('emisor_id')->references('id')->on('users')->cascadeOnDelete();
            $t->foreign('receptor_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
    public function down(): void
    {
        Schema::table('resenas', function (Blueprint $t) {
            $t->dropForeign(['reserva_id', 'emisor_id', 'receptor_id']);
            // no borramos columnas para no perder datos
        });
    }
};
