<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reservas', function (Blueprint $t) {
            if (!Schema::hasColumn('reservas', 'meeting_ended_at')) {
                $t->timestamp('meeting_ended_at')->nullable()->after('meeting_started_at');
            }
        });
    }
    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $t) {
            if (Schema::hasColumn('reservas', 'meeting_ended_at')) $t->dropColumn('meeting_ended_at');
        });
    }
};
