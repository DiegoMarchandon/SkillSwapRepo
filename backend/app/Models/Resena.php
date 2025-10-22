<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resena extends Model
{
    use HasFactory;

    // Especificar el nombre de la tabla si no sigue la convención plural
    protected $table = 'reseñas';

    protected $fillable = [
        'reserva_id',
        'emisor_id',
        'receptor_id',
        'rating',
        'comentario'
    ];

    protected $casts = [
        'rating' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relación con la reserva/sesión
    public function sesion()
    {
        return $this->belongsTo(Reserva::class, 'sesion_id');
    }

    // Relación con el usuario que emite la reseña
    public function emisor()
    {
        return $this->belongsTo(User::class, 'emisor_id');
    }

    // Relación con el instructor que recibe la reseña
    public function receptor()
    {
        return $this->belongsTo(User::class, 'receptor_id');
    }
}