<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Controllers
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
use App\Http\Controllers\AdminController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\NotificacionesController;
use App\Http\Controllers\ResenaController;
use App\Http\Controllers\AdminReportsController;

// Admin
use App\Http\Controllers\Admin\CategoriaController as AdminCategoriaController;
use App\Http\Controllers\Admin\HabilidadController as AdminHabilidadController;
use App\Http\Controllers\Admin\UserBlockController;

// Público
use App\Http\Controllers\Publico\CategoriaPublicController;
use App\Http\Controllers\ContactController;

/*
|--------------------------------------------------------------------------
| AUTH PÚBLICO
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| PÚBLICO
|--------------------------------------------------------------------------
*/
Route::get('/health', fn() => response()->json(['ok' => true]));
Route::get('/instructores/{id}/calendario', [CalendarioController::class, 'show']);
Route::get('/profesores/buscar',             [ProfesoresController::class, 'searchTeachers']);

// Buscador (dos aliases)
Route::get('/buscar',      BuscarHabilidadesController::class);
Route::get('/habilidades', BuscarHabilidadesController::class);

// Categorías públicas (activas)
Route::get('/categorias', [CategoriaPublicController::class, 'index']);

// Contacto
Route::post('/contact', [ContactController::class, 'store']);

/*
|--------------------------------------------------------------------------
| /api/me  (AUTENTICADO, SOLO LEE AL USUARIO)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->get('/me', function (Request $r) {
    $u = $r->user();
    return $u ? [
        'id' => $u->id,
        'name' => $u->name,
        'email' => $u->email,
        'is_admin' => $u->is_admin,
        'rol' => $u->rol,
        'is_blocked' => (bool)$u->is_blocked,
    ] : response()->json(null, 401);
});


/*
|--------------------------------------------------------------------------
| USUARIO AUTENTICADO (aplica bloqueo)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'reject.blocked'])->group(function () {
    // Sesión / usuario
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', fn(Request $r) => $r->user());

    // Perfil
    Route::put('/profile',  [ProfileController::class, 'update']);
    Route::put('/password', [ProfileController::class, 'updatePassword']);

    // Mis habilidades (CRUD)
    Route::get('/my-skills',             [MisHabilidadesController::class, 'index']);
    Route::post('/my-skills',            [MisHabilidadesController::class, 'store']);
    Route::put('/my-skills/{skill}',     [MisHabilidadesController::class, 'update']);
    Route::delete('/my-skills/{skill}',  [MisHabilidadesController::class, 'destroy']);

    // Reservas
    Route::post('/reservas',                 [ReservaController::class, 'store']);
    Route::patch('/reservas/{id}/cancelar',  [ReservaController::class, 'cancelar']);
    Route::get('/mis-reservas',              [ReservaController::class, 'misReservas']);

    // Profesores (autenticado)
    Route::get('/profesores', [ProfesoresController::class, 'getAllTeachers']);

    // Disponibilidades (solo instructor dueño)
    Route::post('/instructores/{id}/disponibilidades', [DisponibilidadController::class, 'store']);

    // Calls + métricas
    Route::get('/calls/{id}',     [CallController::class, 'show']);
    Route::post('/calls',         [CallController::class, 'store']);
    Route::post('/call-metrics',  [CallMetricsController::class, 'store']);

    // Favoritos
    Route::post('/favoritos/agregar', [FavoriteController::class, 'store']);
    Route::delete('/favoritos/remove', [FavoriteController::class, 'destroy']);

    // Notificaciones
    Route::get('/notificaciones',            [NotificacionesController::class, 'index']);
    Route::get('/notificaciones/unread',     [NotificacionesController::class, 'unreadCount']);
    Route::get('/notificaciones/latest',     [NotificacionesController::class, 'latest']);
    Route::post('/notificaciones/{id}/read', [NotificacionesController::class, 'markRead']);
    Route::post('/notificaciones/read-all',  [NotificacionesController::class, 'markAllRead']);

    // Meetings
    Route::get('/meeting/{meetingId}',                     [MeetingController::class, 'show']);
    Route::post('/meeting/{meetingId}/start',              [MeetingController::class, 'start']);
    Route::get('/meeting/{meetingId}/status',              [MeetingController::class, 'status']);
    Route::post('/meeting/{meetingId}/join-waiting-room',  [MeetingController::class, 'joinWaitingRoom']);
    Route::get('/meeting/{meetingId}/waiting-room-status', [MeetingController::class, 'getWaitingRoomStatus']);
    Route::post('/meeting/{meetingId}/end',                [MeetingController::class, 'end']);

    // Reseñas
    Route::get('/resenas/{sesionId}', [ResenaController::class, 'show']);
    Route::post('/resenas',           [ResenaController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| SOLO ADMIN (requiere 'admin', sin reject.blocked)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'admin'])
    ->prefix('admin')
    ->group(function () {
        // Categorías
        Route::apiResource('categorias', AdminCategoriaController::class);

        // Dashboard / reportes
        Route::get('dashboard-stats',       [AdminController::class, 'dashboardStats']);
        Route::get('sesiones/{id}/reporte', [AdminReportsController::class, 'sessionReport']);

        // Usuarios
        Route::get('users',               [AdminController::class, 'getUsers']);
        Route::get('users/{id}/sessions', [AdminController::class, 'getUserSessions']);
        Route::patch('users/{user}/block', [AdminController::class, 'blockUser']);

        // Moderación de habilidades
        Route::get('habilidades',                       [AdminHabilidadController::class, 'index']);
        Route::put('habilidades/{habilidad}',           [AdminHabilidadController::class, 'update']);
        Route::delete('habilidades/{habilidad}',        [AdminHabilidadController::class, 'destroy']);
        Route::post('habilidades/{habilidad}/fusionar', [AdminHabilidadController::class, 'fusionar']);
    });
