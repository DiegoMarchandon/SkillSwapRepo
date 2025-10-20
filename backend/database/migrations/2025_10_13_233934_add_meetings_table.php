<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('meetings')) {
            Schema::create('meetings', function (Blueprint $t) {
                $t->id();
                $t->string('title')->nullable();
                $t->foreignId('host_id')->constrained('users');
                $t->timestamp('scheduled_time');
                $t->integer('duration_minutes');
                $t->string('meeting_link', 100);
                $t->string('status', 20)->default('scheduled');
                $t->timestamps();
            });
        }
    }
    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};
