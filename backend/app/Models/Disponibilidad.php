<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Disponibilidad extends Model
{
    use HasFactory;

    protected $table = 'disponibilidades';

    protected $fillable = [
        'instructor_id',
        'inicio_utc',
        'fin_utc',
        'estado',
        'nota',
        'habilidad_id'
    ];

    protected $casts = [
        'inicio_utc' => 'datetime',
        'fin_utc'    => 'datetime',
    ];

    public function habilidad()
    {
        return $this->belongsTo(\App\Models\Habilidad::class, 'habilidad_id');
    }


    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function reserva()
    {
        return $this->hasOne(Reserva::class, 'disponibilidad_id');
    }
}
