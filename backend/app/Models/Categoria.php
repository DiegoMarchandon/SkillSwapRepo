<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Categoria extends Model
{
    use SoftDeletes;

    protected $fillable = ['nombre', 'slug', 'descripcion', 'activa'];

    public function habilidades()
    {
        return $this->hasMany(Habilidad::class, 'categoria_id');
    }

    public function habilidadesActivas()
    {
        return $this->hasMany(Habilidad::class, 'categoria_id')
            ->whereHas('usuarios', fn($q) => $q->where('usuario_habilidad.estado', 1)); // IMPORTANTÍSIMO
    }
}
