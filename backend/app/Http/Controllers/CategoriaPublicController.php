<?php

namespace App\Http\Controllers\Publico;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaPublicController extends Controller
{
    public function index(Request $r)
    {
        $q = Categoria::query()->select('id', 'nombre', 'activa')->orderBy('nombre');

        // /api/categorias?activa=1 -> solo activas
        if ($r->has('activa') && $r->boolean('activa')) {
            $q->where('activa', true);
        }

        // sin paginar porque es para un select
        return $q->get();
    }
}
