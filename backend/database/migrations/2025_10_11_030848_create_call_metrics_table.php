<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Guarda cada bloque de métricas (cada 5s) asociadas a una call
     */
    public function up(): void
    {
        Schema::create('call_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('call_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamp('timestamp');
            $table->bigInteger('bytes_sent');
            $table->bigInteger('bytes_received');
            $table->float('fps');
            $table->float('latency');
            $table->integer('packets_lost');
            $table->float('jitter');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('call_metrics');
    }
};
