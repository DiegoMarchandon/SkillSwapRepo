<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorito extends Model
{
    use HasFactory;

    protected $table = 'favoritos';

    protected $fillable = [
        'user_id',
        'profesor_id', 
        'usuario_habilidad_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Usuario que agregó el favorito
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Profesor favorito (también es un User)
     */
    public function profesor()
    {
        return $this->belongsTo(User::class, 'profesor_id');
    }

    /**
     * Habilidad específica por la que se agregó el favorito
     */
    public function usuarioHabilidad()
    {
        return $this->belongsTo(UsuarioHabilidad::class, 'usuario_habilidad_id');
    }

    /**
     * Reseña que motivó el favorito (opcional)
     */
    // public function reseña()
    // {
    //     return $this->belongsTo(Reseña::class, 'reseña_id');
    // }
}