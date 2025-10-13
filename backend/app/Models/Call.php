<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Call extends Model
{
    protected $fillable = ['caller_id', 'receiver_id', 'started_at', 'ended_at', 'status', 'usuario_habilidad_id'];

    public function metrics()
    {
        return $this->hasMany(CallMetric::class);
    }

    public function caller()
    {
        return $this->belongsTo(User::class, 'caller_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function usuarioHabilidad()
    {
        return $this->belongsTo(UsuarioHabilidad::class);
    }
    
    public function habilidad()
    {
        return $this->through('usuarioHabilidad', Habilidad::class, 'id', 'id', 'usuario_habilidad_id', 'habilidad_id');
    }
    
    // Accesor para obtener la habilidad fácilmente
    public function getHabilidadAttribute()
    {
        return $this->usuarioHabilidad->habilidad ?? null;
    }

    // Accesor para fácil acceso
    public function getHabilidadNombreAttribute()
    {
        return $this->usuarioHabilidad->habilidad->nombre ?? 'Sin habilidad';
    }
    
    public function getHabilidadNivelAttribute()
    {
        return $this->usuarioHabilidad->nivel ?? null;
    }

}

