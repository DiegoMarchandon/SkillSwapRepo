<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use function Laravel\Prompts\clear;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('usuario_habilidad', function (Blueprint $t) {
            $t->unique(['user_id', 'habilidad_id', 'tipo'], 'uh_user_hab_tipo_unique');
        });
    }
    public function down(): void
    {
        Schema::table('usuario_habilidad', function (Blueprint $t) {
            $t->dropUnique('uh_user_hab_tipo_unique');
        });
    }
};
