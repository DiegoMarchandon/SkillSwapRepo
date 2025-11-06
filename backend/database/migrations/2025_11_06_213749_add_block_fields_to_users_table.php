<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_blocked')) {
                $table->boolean('is_blocked')->default(false)->after('email_verified_at');
            }
            if (!Schema::hasColumn('users', 'blocked_at')) {
                $table->timestamp('blocked_at')->nullable()->after('is_blocked');
            }
            if (!Schema::hasColumn('users', 'blocked_reason')) {
                $table->string('blocked_reason', 500)->nullable()->after('blocked_at');
            }
            if (!Schema::hasColumn('users', 'blocked_by')) {
                $table->unsignedBigInteger('blocked_by')->nullable()->after('blocked_reason');
                $table->foreign('blocked_by')->references('id')->on('users')->nullOnDelete();
            }
            $table->index(['is_blocked', 'blocked_at']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['is_blocked', 'blocked_at']);
            if (Schema::hasColumn('users', 'blocked_by'))   $table->dropForeign(['blocked_by']);
            $table->dropColumn(['blocked_by', 'blocked_reason', 'blocked_at', 'is_blocked']);
        });
    }
};
