<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reservas', function (Blueprint $t) {
            if (!Schema::hasColumn('reservas', 'meeting_id')) {
                $t->string('meeting_id')->nullable()->unique()->after('enlace_reunion');
            }
            if (!Schema::hasColumn('reservas', 'meeting_started_at')) {
                $t->timestamp('meeting_started_at')->nullable()->after('meeting_id');
            }
        });
        if (Schema::hasColumn('reservas', 'meeting_id')) {
            DB::statement("UPDATE reservas SET meeting_id = enlace_reunion WHERE meeting_id IS NULL OR meeting_id = ''");
        }
    }
    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $t) {
            if (Schema::hasColumn('reservas', 'meeting_started_at')) $t->dropColumn('meeting_started_at');
            if (Schema::hasColumn('reservas', 'meeting_id'))         $t->dropColumn('meeting_id');
        });
    }
};
