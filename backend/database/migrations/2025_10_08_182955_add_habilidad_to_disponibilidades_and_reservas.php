<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('disponibilidades', function (Blueprint $t) {
            $t->foreignId('habilidad_id')->nullable()
                ->constrained('habilidad')->nullOnDelete();
            $t->index(['instructor_id', 'habilidad_id', 'inicio_utc']);
        });

        Schema::table('reservas', function (Blueprint $t) {
            $t->foreignId('habilidad_id')->nullable()
                ->constrained('habilidad')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $t) {
            $t->dropConstrainedForeignId('habilidad_id');
        });
        Schema::table('disponibilidades', function (Blueprint $t) {
            $t->dropIndex(['instructor_id', 'habilidad_id', 'inicio_utc']);
            $t->dropConstrainedForeignId('habilidad_id');
        });
    }
};
