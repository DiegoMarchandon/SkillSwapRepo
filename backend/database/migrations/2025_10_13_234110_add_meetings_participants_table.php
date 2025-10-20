<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('meetings_participants')) {
            Schema::create('meetings_participants', function (Blueprint $t) {
                $t->id();
                $t->foreignId('meeting_id')->constrained('meetings')->onDelete('cascade');
                $t->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $t->string('role', 20)->nullable();
                $t->timestamps();
            });
        }
    }
    public function down(): void
    {
        Schema::dropIfExists('meetings_participants');
    }
};
