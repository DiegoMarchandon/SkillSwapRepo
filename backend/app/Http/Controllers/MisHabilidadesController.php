<?php

namespace App\Http\Controllers;

use App\Models\Habilidad;
use App\Models\UsuarioHabilidad;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class MisHabilidadesController extends Controller
{
    // GET /api/my-skills?tipo=ofrecida|deseada
    public function index(Request $r)
    {
        $r->validate(['tipo' => ['nullable', Rule::in(['ofrecida', 'deseada'])]]);

        $q = UsuarioHabilidad::with('habilidad')
            ->where('user_id', $r->user()->id)
            ->join('habilidad', 'habilidad.id', '=', 'usuario_habilidad.habilidad_id')
            ->select('usuario_habilidad.*')
            ->orderBy('habilidad.nombre');

        if ($r->filled('tipo')) {
            $q->where('tipo', $r->tipo);
        }

        return response()->json(
            $q->get()->map(fn($uh) => [
                'id'     => $uh->id,
                'name'   => $uh->habilidad->nombre,
                'tipo'   => $uh->tipo,
                'nivel'  => $uh->nivel,
                'estado' => (bool) $uh->estado,
            ])
        );
    }

    // POST /api/my-skills
    public function store(Request $r)
    {
        $data = $r->validate([
            'nombre'       => 'required|string|max:100',
            'tipo'         => ['required', Rule::in(['ofrecida', 'deseada'])],
            'nivel'        => ['required', Rule::in(['principiante', 'intermedio', 'avanzado'])],
            'categoria_id' => [
                'required',
                'integer',
                Rule::exists('categorias', 'id')->where(fn($q) => $q->where('activa', true)),
            ],
        ]);

        $slug            = Str::slug($data['nombre']);
        $estadoHabilidad = config('skills.auto_approve', true) ? 'aprobada' : 'pendiente';

        $habilidad = Habilidad::firstOrCreate(
            ['categoria_id' => $data['categoria_id'], 'slug' => $slug],
            ['nombre' => $data['nombre'], 'estado' => $estadoHabilidad]
        );

        UsuarioHabilidad::updateOrCreate(
            ['user_id' => $r->user()->id, 'habilidad_id' => $habilidad->id, 'tipo' => $data['tipo']],
            ['nivel' => $data['nivel'], 'estado' => 1]
        );

        return response()->json(['ok' => true]);
    }

    // PUT /api/my-skills/{skill}
    public function update(Request $r, UsuarioHabilidad $skill)
    {
        if ($skill->user_id !== $r->user()->id) abort(403);

        $data = $r->validate([
            'tipo'   => ['required', Rule::in(['ofrecida', 'deseada'])],
            'nivel'  => ['nullable', Rule::in(['principiante', 'intermedio', 'avanzado'])],
            'estado' => ['nullable', 'boolean'],
        ]);

        $payload = ['tipo' => $data['tipo']];
        if (array_key_exists('nivel', $data))  $payload['nivel']  = $data['nivel'];
        if (array_key_exists('estado', $data)) $payload['estado'] = $data['estado'] ? 1 : 0;

        $skill->update($payload);

        return response()->json($skill->fresh('habilidad'));
    }

    // DELETE /api/my-skills/{skill}
    public function destroy(Request $r, UsuarioHabilidad $skill)
    {
        if ($skill->user_id !== $r->user()->id) abort(403);
        $skill->delete();
        return response()->json(['ok' => true]);
    }
}
