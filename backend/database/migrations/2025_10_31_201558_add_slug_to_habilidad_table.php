<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('habilidad', function (Blueprint $table) {
            $table->string('slug', 120)->nullable()->after('nombre');
        });

        $rows = DB::table('habilidad')->select('id', 'nombre', 'categoria_id')->get();
        $seen = [];
        foreach ($rows as $r) {
            $base = Str::slug($r->nombre);
            $key  = ($r->categoria_id ?? 0) . ':' . $base;
            $slug = $base;
            $i = 2;
            while (isset($seen[$key]) || DB::table('habilidad')->where('categoria_id', $r->categoria_id)->where('slug', $slug)->exists()) {
                $slug = $base . '-' . $i;
                $key  = ($r->categoria_id ?? 0) . ':' . $slug;
                $i++;
            }
            $seen[$key] = true;
            DB::table('habilidad')->where('id', $r->id)->update(['slug' => $slug]);
        }

        Schema::table('habilidad', function (Blueprint $table) {
            $table->unique(['categoria_id', 'slug'], 'habilidad_categoria_slug_unique');
        });
    }

    public function down(): void
    {
        Schema::table('habilidad', function (Blueprint $table) {
            $table->dropUnique('habilidad_categoria_slug_unique');
            $table->dropColumn('slug');
        });
    }
};
