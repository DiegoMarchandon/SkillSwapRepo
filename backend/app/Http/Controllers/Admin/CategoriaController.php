<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class CategoriaController extends Controller
{
    public function index(Request $r)
    {
        $q = Categoria::query()
            ->withCount(['habilidades', 'habilidadesActivas'])
            ->when($r->filled('activa'), fn($q2) => $q2->where('activa', $r->boolean('activa')))
            ->when($r->filled('q'), fn($q2) => $q2->where('nombre', 'like', '%' . $r->q . '%'))
            ->orderBy('nombre');

        return $q->paginate(20);
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'nombre'      => [
                'required',
                'string',
                'max:100',
                Rule::unique('categorias', 'nombre')->whereNull('deleted_at'),
            ],
            'descripcion' => ['nullable', 'string', 'max:500'],
            'activa'      => ['boolean'],
        ]);

        $slug = Str::slug($data['nombre']);

        // Si existe (soft-deleted), restaurar
        $exist = Categoria::withTrashed()->where('slug', $slug)->first();
        if ($exist) {
            if ($exist->trashed()) {
                $exist->restore();
                $exist->update([
                    'nombre'      => $data['nombre'],
                    'descripcion' => $data['descripcion'] ?? null,
                    'activa'      => $data['activa'] ?? true,
                ]);
                return response()->json($exist->fresh()->loadCount(['habilidades', 'habilidadesActivas']), 201);
            }
            return response()->json(['message' => 'Ya existe una categoría con ese nombre.'], 422);
        }

        $cat = Categoria::create([
            'nombre'      => $data['nombre'],
            'slug'        => $slug,
            'descripcion' => $data['descripcion'] ?? null,
            'activa'      => $data['activa'] ?? true,
        ]);

        return response()->json($cat->loadCount(['habilidades', 'habilidadesActivas']), 201);
    }

    public function update(Request $r, Categoria $categoria)
    {
        $data = $r->validate([
            'nombre'      => [
                'required',
                'string',
                'max:100',
                Rule::unique('categorias', 'nombre')
                    ->ignore($categoria->id)
                    ->whereNull('deleted_at'),
            ],
            'descripcion' => ['nullable', 'string', 'max:500'],
            'activa'      => ['boolean'],
        ]);

        $payload = [
            'nombre'      => $data['nombre'],
            'descripcion' => $data['descripcion'] ?? null,
            'activa'      => $data['activa'] ?? $categoria->activa,
        ];

        if ($categoria->nombre !== $data['nombre']) {
            $payload['slug'] = Str::slug($data['nombre']);
        }

        $categoria->update($payload);

        return $categoria->fresh()->loadCount(['habilidades', 'habilidadesActivas']);
    }

    public function destroy(Categoria $categoria)
    {
        if ($categoria->slug === 'otros') {
            return response()->json(['message' => 'No se puede eliminar la categoría por defecto.'], 422);
        }

        // Regla: si tiene habilidades EN USO activo, no se puede eliminar
        if ($categoria->habilidadesActivas()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar: hay habilidades en uso activo.'
            ], 409);
        }

        // No hay uso activo → reasignar TODAS sus habilidades a "Otros" y borrar la categoría
        DB::transaction(function () use ($categoria) {
            $otros = Categoria::withTrashed()->where('slug', 'otros')->first();
            if (!$otros) {
                $otros = Categoria::create([
                    'nombre' => 'Otros',
                    'slug'   => 'otros',
                    'activa' => true,
                ]);
            } elseif ($otros->trashed()) {
                $otros->restore();
            }

            // Reasignar habilidades (si existen) a "Otros"
            $categoria->habilidades()->update(['categoria_id' => $otros->id]);

            // Soft delete (si querés hard delete, cambiá por forceDelete)
            $categoria->delete();
        });

        return response()->noContent();
    }
}
