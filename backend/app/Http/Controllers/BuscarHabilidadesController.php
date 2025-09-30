<?php

namespace App\Http\Controllers;

use App\Models\UsuarioHabilidad;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth; // <-- importar

class BuscarHabilidadesController extends Controller
{
    public function __invoke(Request $r)
    {
        $data = $r->validate([
            'habilidad' => ['nullable', 'string', 'max:100'],
            'tipo'      => ['nullable', Rule::in(['ofrecida', 'deseada'])],
            'nivel'     => ['nullable', Rule::in(['principiante', 'intermedio', 'avanzado'])],
        ]);

        $tipo = $data['tipo'] ?? 'ofrecida';

        // activamos el guard 'sanctum' (opcional) y tomamos el user si vino token
        Auth::shouldUse('sanctum');
        $currentUser = Auth::user(); // null si no hay token válido

        $rows = UsuarioHabilidad::with(['habilidad:id,nombre', 'user:id,name'])
            ->where('tipo', $tipo)
            ->when($currentUser, fn($q) => $q->where('user_id', '!=', $currentUser->id)) // excluirse
            ->when(!empty($data['habilidad']), function ($q) use ($data) {
                $q->whereHas(
                    'habilidad',
                    fn($qq) =>
                    $qq->where('nombre', 'like', '%' . $data['habilidad'] . '%')
                );
            })
            ->when(!empty($data['nivel']), fn($q) => $q->where('nivel', $data['nivel']))
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
                    'id'   => $uh->user->id,
                    'name' => $uh->user->name,
                ],
            ]);

        return response()->json($rows);
    }
}
