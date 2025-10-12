<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\MisHabilidadesController;
use App\Http\Controllers\BuscarHabilidadesController;
use App\Http\Controllers\ProfesoresController;
use App\Http\Controllers\CalendarioController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\DisponibilidadController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\CallMetricsController;
use App\Http\Controllers\CallController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// 👇 PÚBLICO: ver calendario
Route::get('/instructores/{id}/calendario', [CalendarioController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    // Sesión / usuario
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', fn(Request $r) => $r->user());

    // Perfil
    Route::put('/profile',  [ProfileController::class, 'update']);
    Route::put('/password', [ProfileController::class, 'updatePassword']);

    // Reservas
    Route::post('/reservas', [ReservaController::class, 'store']);
    Route::patch('/reservas/{id}/cancelar', [ReservaController::class, 'cancelar']);
    Route::get('/mis-reservas', [ReservaController::class, 'misReservas']);

    // Mis habilidades (CRUD)
    Route::get('/my-skills',                   [MisHabilidadesController::class, 'index']);
    Route::post('/my-skills',                  [MisHabilidadesController::class, 'store']);
    Route::put('/my-skills/{skill}',           [MisHabilidadesController::class, 'update']);
    Route::delete('/my-skills/{skill}',        [MisHabilidadesController::class, 'destroy']);

    // Profesores
    Route::get('/profesores',        [ProfesoresController::class, 'getAllTeachers']);
    Route::get('/profesores/buscar', [ProfesoresController::class, 'searchTeachers']);

    // Crear disponibilidades (solo instructor dueño)
    Route::post('/instructores/{id}/disponibilidades', [DisponibilidadController::class, 'store']);

    // endpoint para recibir las métricas
    
    Route::post('/calls', [CallController::class, 'index']);
    Route::get('/calls/{id}', [CallController::class, 'show']);
    Route::post('/calls', [CallController::class, 'store']);
    
});
Route::post('/call-metrics', [CallMetricsController::class, 'store']);

Route::get('/profesores/buscar', [ProfesoresController::class, 'searchTeachers']);
// Búsqueda pública de habilidades (profes que enseñan o gente que quiere aprender)

Route::get('/buscar', BuscarHabilidadesController::class); // ?habilidad=java&modo=teach|learn

// Búsqueda pública
Route::get('/buscar', BuscarHabilidadesController::class);
Route::get('/health', fn() => response()->json(['ok' => true]));



