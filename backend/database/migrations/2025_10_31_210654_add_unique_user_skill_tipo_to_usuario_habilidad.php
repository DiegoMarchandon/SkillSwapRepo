<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // 1) Limpieza por si ya hay duplicados (guardamos el menor id y borramos el resto)
        $dups = DB::table('usuario_habilidad as uh')
            ->select('user_id', 'habilidad_id', 'tipo', DB::raw('MIN(id) as keep_id'), DB::raw('COUNT(*) as c'))
            ->groupBy('user_id', 'habilidad_id', 'tipo')
            ->having('c', '>', 1)
            ->get();

        foreach ($dups as $d) {
            DB::table('usuario_habilidad')
                ->where('user_id', $d->user_id)
                ->where('habilidad_id', $d->habilidad_id)
                ->where('tipo', $d->tipo)
                ->where('id', '!=', $d->keep_id)
                ->delete();
        }

        // 2) Índice único: un usuario no puede tener dos filas con la misma habilidad y el mismo tipo
        Schema::table('usuario_habilidad', function (Blueprint $table) {
            $table->unique(['user_id', 'habilidad_id', 'tipo'], 'ux_user_skill_tipo');
        });
    }

    public function down(): void
    {
        Schema::table('usuario_habilidad', function (Blueprint $table) {
            $table->dropUnique('ux_user_skill_tipo');
        });
    }
};
