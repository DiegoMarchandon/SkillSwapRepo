<?php

namespace App\Http\Controllers;

use App\Models\UsuarioHabilidad;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class BuscarHabilidadesController extends Controller
{
    // GET /api/habilidades?habilidad=laravel&tipo=ofrecida|deseada&nivel=principiante|intermedio|avanzado&categoria_id=#&orden=recientes|nombre_asc&page=1
    public function __invoke(Request $r)
    {
        $data = $r->validate([
            'habilidad'    => ['nullable', 'string', 'max:100'],
            'tipo'         => ['nullable', Rule::in(['ofrecida', 'deseada'])],
            'nivel'        => ['nullable', Rule::in(['principiante', 'intermedio', 'avanzado'])],
            'categoria_id' => ['nullable', 'integer', 'exists:categorias,id'],
            'orden'        => ['nullable', Rule::in(['recientes', 'nombre_asc'])],
            'page'         => ['nullable', 'integer', 'min:1'],
        ]);

        $tipo = $data['tipo'] ?? 'ofrecida';

        // Contexto de usuario (opcional)
        Auth::shouldUse('sanctum');
        $currentUser = Auth::user(); // null si no hay token

        $q = UsuarioHabilidad::query()
            ->with([
                'habilidad:id,nombre,categoria_id,estado',
                'habilidad.categoria:id,nombre,activa',
                'user:id,name',
            ])
            // Pivot en booleano
            ->where('usuario_habilidad.estado', 1)
            ->where('usuario_habilidad.tipo', $tipo)
            ->when($currentUser, fn($q) => $q->where('usuario_habilidad.user_id', '!=', $currentUser->id))
            ->when(!empty($data['habilidad']), function ($q) use ($data) {
                $q->whereHas('habilidad', function ($h) use ($data) {
                    $h->where('nombre', 'like', '%' . $data['habilidad'] . '%');
                });
            })
            ->when(!empty($data['nivel']), fn($q) => $q->where('usuario_habilidad.nivel', $data['nivel']))
            // Solo habilidades aprobadas y categorías activas
            ->whereHas('habilidad', function ($h) use ($data) {
                $h->where('estado', 'aprobada')
                    ->when(!empty($data['categoria_id']), fn($h) => $h->where('categoria_id', $data['categoria_id']))
                    ->whereHas('categoria', fn($c) => $c->where('activa', 1));
            });

        // Orden
        if (($data['orden'] ?? 'recientes') === 'nombre_asc') {
            $q->join('habilidad as h', 'usuario_habilidad.habilidad_id', '=', 'h.id')
                ->orderBy('h.nombre')
                ->select('usuario_habilidad.*')
                ->distinct('usuario_habilidad.id');
        } else {
            $q->orderBy('usuario_habilidad.created_at', 'desc');
        }

        // Paginación y mapeo
        $rows = $q->paginate(20)->through(function ($uh) {
            return [
                'skill' => [
                    'id'        => $uh->habilidad->id,   // <-- HABILIDAD.ID (correcto para filtrar slots)
                    'pivot_id'  => $uh->id,              // <-- USUARIO_HABILIDAD.ID (por si lo querés usar)
                    'name'      => $uh->habilidad->nombre,
                    'nivel'     => $uh->nivel,
                    'categoria' => [
                        'id'   => optional($uh->habilidad->categoria)->id,
                        'name' => optional($uh->habilidad->categoria)->nombre,
                    ],
                ],
                'user' => [
                    'id'   => $uh->user->id,
                    'name' => $uh->user->name,
                ],
            ];
        });


        return response()->json($rows);
    }
}
