<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Habilidad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HabilidadController extends Controller
{
    /**
     * GET /api/admin/habilidades
     * Filtros: ?q=texto&categoria_id=1&estado=aprobada|pendiente|oculta&orden=usos_desc|nombre_asc
     */
    public function index(Request $r)
    {
        $q = Habilidad::query()
            ->with('categoria:id,nombre') // muestra la categoría
            ->withCount([
                'usuarios as usos_activos' => fn($u) => $u->where('usuario_habilidad.estado', 'activo'),
                'usuarios as usos_totales'
            ]);

        if ($txt = $r->query('q'))            $q->where('nombre', 'like', "%{$txt}%");
        if ($cat = $r->query('categoria_id')) $q->where('categoria_id', $cat);
        if ($est = $r->query('estado'))       $q->whereIn('estado', ['pendiente', 'aprobada', 'oculta'])->where('estado', $est);

        $orden = $r->query('orden', 'usos_desc');
        if ($orden === 'nombre_asc') $q->orderBy('nombre');
        else                         $q->orderByDesc('usos_activos')->orderBy('nombre');

        return $q->paginate(20);
    }

    /**
     * PUT /api/admin/habilidades/{habilidad}
     * Permite renombrar, recategorizar y cambiar estado de moderación.
     */
    public function update(Request $r, Habilidad $habilidad)
    {
        $data = $r->validate([
            'nombre'       => 'required|string|max:100',
            'descripcion'  => 'nullable|string|max:500',
            'categoria_id' => 'nullable|exists:categorias,id',
            'estado'       => 'nullable|in:pendiente,aprobada,oculta',
        ]);

        $habilidad->update($data);
        return $habilidad->fresh()->load('categoria:id,nombre');
    }

    /**
     * DELETE /api/admin/habilidades/{habilidad}
     * Solo si no está en uso activo por usuarios.
     */
    public function destroy(Habilidad $habilidad)
    {
        $enUso = $habilidad->usuarios()->where('usuario_habilidad.estado', 'activo')->exists();
        if ($enUso) {
            return response()->json([
                'message' => 'No se puede eliminar: hay usuarios con esta habilidad activa.'
            ], 409);
        }
        $habilidad->delete(); // soft delete
        return response()->noContent();
    }

    /**
     * POST /api/admin/habilidades/{habilidad}/fusionar
     * Mueve todos los usos (usuario_habilidad) a otra habilidad y borra (soft) la de origen.
     */
    public function fusionar(Request $r, Habilidad $habilidad)
    {
        $data = $r->validate([
            'destino_id' => 'required|different:habilidad|exists:habilidad,id', // tu tabla es singular
        ]);

        $destino = Habilidad::findOrFail($data['destino_id']);

        DB::transaction(function () use ($habilidad, $destino) {
            // mover filas de la tabla pivot
            DB::table('usuario_habilidad')
                ->where('habilidad_id', $habilidad->id)
                ->update(['habilidad_id' => $destino->id]);

            // si el destino no tiene categoría y el origen sí, hereda
            if (!$destino->categoria_id && $habilidad->categoria_id) {
                $destino->update(['categoria_id' => $habilidad->categoria_id]);
            }

            $habilidad->delete(); // soft
        });

        return response()->json(['message' => 'Fusionada en ' . $destino->nombre]);
    }
}
