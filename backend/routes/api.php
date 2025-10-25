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
use App\Http\Controllers\AdminController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\NotificacionesController;
use App\Http\Controllers\ResenaController;
use App\Http\Controllers\AdminReportsController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// PÚBLICO
Route::get('/instructores/{id}/calendario', [CalendarioController::class, 'show']);
Route::get('/profesores/buscar', [ProfesoresController::class, 'searchTeachers']);
Route::get('/buscar', BuscarHabilidadesController::class);
Route::get('/health', fn() => response()->json(['ok' => true]));

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
    Route::get('/my-skills',            [MisHabilidadesController::class, 'index']);
    Route::post('/my-skills',           [MisHabilidadesController::class, 'store']);
    Route::put('/my-skills/{skill}',    [MisHabilidadesController::class, 'update']);
    Route::delete('/my-skills/{skill}', [MisHabilidadesController::class, 'destroy']);

    // Profesores
    Route::get('/profesores', [ProfesoresController::class, 'getAllTeachers']);

    // Disponibilidades (solo instructor dueño)
    Route::post('/instructores/{id}/disponibilidades', [DisponibilidadController::class, 'store']);

    // Calls + métricas
    Route::get('/calls/{id}', [CallController::class, 'show']);
    Route::post('/calls', [CallController::class, 'store']);
    Route::post('/call-metrics', [CallMetricsController::class, 'store']);

    // Favoritos
    Route::delete('/favoritos/remove', [FavoriteController::class, 'destroy']);
    Route::post('/favoritos/agregar', [FavoriteController::class, 'store']);

    // Notificaciones
    Route::get('/notificaciones',            [NotificacionesController::class, 'index']);
    Route::get('/notificaciones/unread',     [NotificacionesController::class, 'unreadCount']);
    Route::get('/notificaciones/latest',     [NotificacionesController::class, 'latest']);
    Route::post('/notificaciones/{id}/read', [NotificacionesController::class, 'markRead']);
    Route::post('/notificaciones/read-all',  [NotificacionesController::class, 'markAllRead']);

    // Meetings
    Route::get('/meeting/{meetingId}',              [MeetingController::class, 'show']);
    Route::post('/meeting/{meetingId}/start',       [MeetingController::class, 'start']);
    Route::get('/meeting/{meetingId}/status',       [MeetingController::class, 'status']);
    Route::post('/meeting/{meetingId}/join-waiting-room', [MeetingController::class, 'joinWaitingRoom']);
    Route::get('/meeting/{meetingId}/waiting-room-status', [MeetingController::class, 'getWaitingRoomStatus']);
    Route::post('/meeting/{meetingId}/end',         [MeetingController::class, 'end']);

    // ===================== SOLO ADMIN =====================
    Route::get('/admin/dashboard-stats', [AdminController::class, 'dashboardStats']);
    Route::get('/admin/users',           [AdminController::class, 'getUsers']);
    Route::get('/admin/users/{id}/sessions', [AdminController::class, 'getUserSessions']);
    Route::get('/admin/sesiones/{reserva}/reporte', [AdminReportsController::class, 'sessionReport']);
});
