<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('categorias', function (Blueprint $t) {
            $t->id();
            $t->string('nombre')->unique();
            $t->string('slug')->unique();
            $t->text('descripcion')->nullable();
            $t->boolean('activa')->default(true);
            $t->timestamps();
            $t->softDeletes();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('categorias');
    }
};
