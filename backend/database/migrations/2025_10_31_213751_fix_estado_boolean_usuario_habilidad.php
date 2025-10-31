<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1) Agrego columna temporal booleana
        DB::statement("ALTER TABLE `usuario_habilidad` ADD COLUMN `estado_tmp` TINYINT(1) NOT NULL DEFAULT 1 AFTER `nivel`");

        // 2) Copio datos desde la columna vieja a la nueva, mapeando strings -> 1/0
        //    Cubro variantes comunes: activo/activa/true/1 vs inactivo/inactiva/false/0
        DB::statement("
            UPDATE `usuario_habilidad`
            SET `estado_tmp` = CASE
                WHEN `estado` IS NULL THEN 1
                WHEN `estado` IN ('1','true','TRUE','on','activo','activa','ACTIVO','ACTIVA') THEN 1
                ELSE 0
            END
        ");

        // 3) Quito la columna vieja `estado`
        DB::statement("ALTER TABLE `usuario_habilidad` DROP COLUMN `estado`");

        // 4) Renombro `estado_tmp` -> `estado` (queda booleana definitiva)
        DB::statement("ALTER TABLE `usuario_habilidad` CHANGE `estado_tmp` `estado` TINYINT(1) NOT NULL DEFAULT 1");
    }

    public function down(): void
    {
        // Reversión (opcional): vuelvo a string simple
        DB::statement("ALTER TABLE `usuario_habilidad` ADD COLUMN `estado_old` VARCHAR(20) NULL AFTER `estado`");
        DB::statement("
            UPDATE `usuario_habilidad`
            SET `estado_old` = CASE WHEN `estado`=1 THEN 'activo' ELSE 'inactivo' END
        ");
        DB::statement("ALTER TABLE `usuario_habilidad` DROP COLUMN `estado`");
        DB::statement("ALTER TABLE `usuario_habilidad` CHANGE `estado_old` `estado` VARCHAR(20) NULL");
    }
};
