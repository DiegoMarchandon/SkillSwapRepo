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
        Schema::create('meetings', function (Blueprint $table) {
            $table->id(); //  clave primaria
            $table->string('title', 255)->nullable();
            $table->unsignedBigInteger('host_id'); // Clave foránea a la tabla users
            $table->timestamp('scheduled_time');
            $table->integer('duration_minutes');
            $table->string('meeting_link', 100)->unique(); // Enlace único
            $table->string('status', 20)->default('scheduled'); // scheduled, active, ended
            $table->timestamps(); // created_at y updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};
