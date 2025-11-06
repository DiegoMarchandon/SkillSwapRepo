<?php

namespace App\Http\Controllers\Publico;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Categoria;

class CategoriaPublicController extends Controller
{
    /**
     * GET /api/categorias
     * Por defecto devuelve solo categorías activas.
     * Pasá ?all=1 si querés todas.
     */
    public function index(Request $request)
    {
        $q = Categoria::query();

        if (! $request->boolean('all')) {
            $q->where('activa', 1);
        }

        $items = $q->orderBy('nombre')
            ->get(['id', 'nombre', 'descripcion', 'activa']);

        return response()->json(['data' => $items]);
    }
}
