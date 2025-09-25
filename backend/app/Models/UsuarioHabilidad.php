<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsuarioHabilidad extends Model
{
    protected $table = 'usuario_habilidad';
    protected $fillable = ['user_id', 'habilidad_id', 'tipo', 'nivel', 'estado'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function habilidad()
    {
        return $this->belongsTo(Habilidad::class);
    }
}
