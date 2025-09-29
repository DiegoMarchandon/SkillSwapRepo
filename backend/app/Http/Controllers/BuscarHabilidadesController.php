<?php

namespace App\Http\Controllers;

use App\Models\UsuarioHabilidad;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BuscarHabilidadesController extends Controller
{
    // GET /api/buscar?habilidad=java&tipo=ofrecida|deseada
    public function __invoke(Request $r)
    {
        $data = $r->validate([
            'habilidad' => ['required', 'string', 'max:100'],
            'tipo'      => ['nullable', Rule::in(['ofrecida', 'deseada'])],
        ]);
        $tipo = $data['tipo'] ?? 'ofrecida'; // por defecto: profesores (enseñan)

        $rows = UsuarioHabilidad::with(['habilidad:id,nombre', 'user:id,name'])
            ->where('tipo', $tipo)
            ->whereHas('habilidad', fn($q) => $q->where('nombre', 'like', '%' . $data['habilidad'] . '%'))
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(fn($uh) => [
                'skill' => [
                    'id'    => $uh->id,
                    'name'  => $uh->habilidad->nombre,
                    'nivel' => $uh->nivel,
                ],
                'user' => [
                    'id'    => $uh->user->id,
                    'name'  => $uh->user->name,
                    'avatar_url' => $uh->user->avatar_path ? url('storage/' . $uh->user->avatar_path) : null,
                ],
            ]);

        return response()->json($rows);
    }
}
