<?php

namespace App\Http\Controllers;

use App\Models\Disponibilidad;
use Illuminate\Http\Request;

class CalendarioController extends Controller
{
    // GET /api/instructores/{id}/calendario?from=...&to=...
    public function show($id, Request $r)
    {
        $r->validate([
            'from' => ['required', 'date'],
            'to'   => ['required', 'date', 'after:from'],
        ]);

        $slots = Disponibilidad::where('instructor_id', $id)
            ->whereBetween('inicio_utc', [$r->from, $r->to])
            ->orderBy('inicio_utc')
            ->get()
            ->map(fn($s) => [
                'id'         => $s->id,
                'inicio_utc' => $s->inicio_utc->toISOString(),
                'fin_utc'    => $s->fin_utc->toISOString(),
                'estado'     => $s->estado,
                'nota'       => $s->nota,
            ]);

        return response()->json(['data' => $slots]);
    }
}
