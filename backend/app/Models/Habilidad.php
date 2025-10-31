<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Habilidad extends Model
{
    use \Illuminate\Database\Eloquent\SoftDeletes;

    protected $table = 'habilidad';
    protected $fillable = ['nombre', 'slug', 'categoria_id', 'estado'];

    public function categoria()
    {
        return $this->belongsTo(\App\Models\Categoria::class, 'categoria_id');
    }

    public function usuarios()
    {
        return $this->belongsToMany(User::class, 'usuario_habilidad', 'habilidad_id', 'user_id')
            ->withPivot(['tipo', 'nivel', 'estado'])
            ->withTimestamps();
    }
}
