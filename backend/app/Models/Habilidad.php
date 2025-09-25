<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Habilidad extends Model
{
    protected $table = 'habilidad';
    protected $fillable = ['nombre', 'descripcion'];

    public function usuarios()
    {
        return $this->belongsToMany(User::class, 'usuario_habilidad')
            ->withPivot(['tipo', 'nivel', 'estado'])
            ->withTimestamps();
    }
}
