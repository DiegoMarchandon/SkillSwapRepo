<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    
    public function up(): void
    {
        // Cambiar el tipo de meeting_id de string a bigint
        DB::statement('ALTER TABLE calls MODIFY meeting_id BIGINT UNSIGNED NULL');
        
        // Crear la foreign key
        Schema::table('calls', function (Blueprint $table) {
            $table->foreign('meeting_id')->references('id')->on('meetings')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('calls', function (Blueprint $table) {
            $table->dropForeign(['meeting_id']);
        });
        
        // Revertir el tipo a string
        DB::statement('ALTER TABLE calls MODIFY meeting_id VARCHAR(255) NULL');
    }
};

