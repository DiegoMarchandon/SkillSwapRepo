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
        Schema::table('users', function (Blueprint $table) {
            //Ajusto longitud de email
            $table->string('email', 150)->change();

            // Nuevas columnas
            $table->enum('rol',['usuario','admin'])->default('usuario');
            $table->unsignedInteger(('creditos'))->default(0);
            $table->enum('condicion',['activo','bloqueado'])->default('activo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // revertir los cambios si se hace rollback (deshacer cambios)
            $table->dropColumn(['rol', 'creditos', 'condicion']);
            $table->string('email', 255)->change();
        });
    }
};
