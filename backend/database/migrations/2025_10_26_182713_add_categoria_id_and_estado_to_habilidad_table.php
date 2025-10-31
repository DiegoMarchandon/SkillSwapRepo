<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('habilidad', function (Blueprint $t) {
            if (!Schema::hasColumn('habilidad', 'categoria_id')) {
                $t->foreignId('categoria_id')->nullable()
                    ->constrained('categorias')->nullOnDelete();
            }
            if (!Schema::hasColumn('habilidad', 'estado')) {
                $t->enum('estado', ['pendiente', 'aprobada', 'oculta'])->default('aprobada');
            }
            if (!Schema::hasColumn('habilidad', 'deleted_at')) {
                $t->softDeletes();
            }
        });
    }
    public function down(): void
    {
        Schema::table('habilidad', function (Blueprint $t) {
            if (Schema::hasColumn('habilidad', 'categoria_id')) $t->dropConstrainedForeignId('categoria_id');
            if (Schema::hasColumn('habilidad', 'estado'))       $t->dropColumn('estado');
            if (Schema::hasColumn('habilidad', 'deleted_at'))   $t->dropColumn('deleted_at');
        });
    }
};
