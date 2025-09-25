<?php

namespace App\Http\Controllers;

use App\Models\Habilidad;
use App\Models\UsuarioHabilidad;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MisHabilidadesController extends Controller
{
    // GET /api/my-skills?tipo=ofrecida|deseada
    public function index(Request $r)
    {
        $r->validate(['tipo' => ['nullable', Rule::in(['ofrecida', 'deseada'])]]);

        $q = UsuarioHabilidad::with('habilidad')
            ->where('user_id', $r->user()->id)
            ->join('habilidad', 'habilidad.id', '=', 'usuario_habilidad.habilidad_id')
            ->select('usuario_habilidad.*')               // importante para que devuelva el modelo correcto
            ->orderBy('habilidad.nombre');

        if ($r->filled('tipo')) $q->where('tipo', $r->tipo);

        return response()->json($q->get()->map(fn($uh) => [
            'id'     => $uh->id,
            'name'   => $uh->habilidad->nombre,
            'tipo'   => $uh->tipo,     // ofrecida/deseada
            'nivel'  => $uh->nivel,    // principiante/intermedio/avanzado (nullable)
            'estado' => $uh->estado,   // activa/inactiva
        ]));
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'habilidad_id' => ['nullable', 'integer', 'exists:habilidad,id'],
            'nombre'       => ['nullable', 'string', 'max:100'],
            'tipo'         => ['required', Rule::in(['ofrecida', 'deseada'])],
            'nivel'        => ['nullable', 'string', 'max:50'],
            'estado'       => ['nullable', Rule::in(['activa', 'inactiva'])],
        ]);

        // ⚠️ usar null coalescing para keys opcionales
        $habId  = $data['habilidad_id'] ?? null;
        $nombre = $data['nombre']       ?? null;

        if (!$habId && !$nombre) {
            return response()->json(['message' => 'Ingresá habilidad_id o nombre'], 422);
        }

        if (!$habId) {
            $habId = Habilidad::firstOrCreate(
                ['nombre' => $nombre],
                ['descripcion' => null]
            )->id;
        }

        $exists = UsuarioHabilidad::where('user_id', $r->user()->id)
            ->where('habilidad_id', $habId)
            ->where('tipo', $data['tipo'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Ya cargaste esa habilidad en esa modalidad'], 422);
        }

        $uh = UsuarioHabilidad::create([
            'user_id'      => $r->user()->id,
            'habilidad_id' => $habId,
            'tipo'         => $data['tipo'],
            'nivel'        => $data['nivel']  ?? null,
            'estado'       => $data['estado'] ?? 'activa',
        ]);

        // devolvemos con la relación cargada (así el front lee data.habilidad.nombre)
        return response()->json($uh->load('habilidad'), 201);
    }


    public function update(Request $r, UsuarioHabilidad $skill)
    {
        if ($skill->user_id !== $r->user()->id) abort(403);

        $data = $r->validate([
            'habilidad_id' => ['nullable', 'integer', 'exists:habilidad,id'],
            'nombre'       => ['nullable', 'string', 'max:100'],
            'tipo'         => ['required', Rule::in(['ofrecida', 'deseada'])],
            'nivel'        => ['nullable', 'string', 'max:50'],
            'estado'       => ['nullable', Rule::in(['activa', 'inactiva'])],
        ]);

        $habId  = $data['habilidad_id'] ?? null;
        $nombre = $data['nombre']       ?? null;

        if (!$habId && $nombre) {
            $habId = Habilidad::firstOrCreate(['nombre' => $nombre], ['descripcion' => null])->id;
        }
        if (!$habId) $habId = $skill->habilidad_id;

        $dup = UsuarioHabilidad::where('user_id', $r->user()->id)
            ->where('id', '!=', $skill->id)
            ->where('habilidad_id', $habId)
            ->where('tipo', $data['tipo'])
            ->exists();

        if ($dup) return response()->json(['message' => 'Duplicado'], 422);

        $skill->update([
            'habilidad_id' => $habId,
            'tipo'         => $data['tipo'],
            'nivel'        => $data['nivel']  ?? null,
            'estado'       => $data['estado'] ?? $skill->estado,
        ]);

        return response()->json($skill->load('habilidad'));
    }


    public function destroy(Request $r, UsuarioHabilidad $skill)
    {
        if ($skill->user_id !== $r->user()->id) abort(403);
        $skill->delete();
        return response()->json(['ok' => true]);
    }
}
