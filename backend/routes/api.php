<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MisHabilidadesController;
use App\Http\Controllers\BuscarHabilidadesController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // Sesión / usuario
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', fn(Request $r) => $r->user());

    // Perfil
    Route::put('/profile',  [ProfileController::class, 'update']);
    Route::put('/password', [ProfileController::class, 'updatePassword']);

    // Mis habilidades (CRUD)
    Route::get('/my-skills',                 [MisHabilidadesController::class, 'index']);
    Route::post('/my-skills',                 [MisHabilidadesController::class, 'store']);
    Route::put('/my-skills/{skill}',         [MisHabilidadesController::class, 'update']);
    Route::delete('/my-skills/{skill}',         [MisHabilidadesController::class, 'destroy']);
});

// Búsqueda pública de habilidades (profes que enseñan o gente que quiere aprender)
Route::get('/buscar', BuscarHabilidadesController::class); // ?habilidad=java&modo=teach|learn

Route::get('/health', fn() => response()->json(['ok' => true]));
