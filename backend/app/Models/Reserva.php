<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Reserva extends Model
{
    use HasFactory;

    protected $table = 'reservas';

    protected $fillable = [
        'disponibilidad_id',
        'instructor_id',
        'alumno_id',
        'estado',
        'enlace_reunion',
        'inicio_real_utc',
        'fin_real_utc',
        'duracion_real_min',
        'creditos_cobrados',
        'habilidad_id',
        'meeting_started_at',
        'meeting_id',
        'meeting_ended_at'
    ];

    protected $casts = [
        'inicio_real_utc' => 'datetime',
        'fin_real_utc'    => 'datetime',
        'meeting_started_at' => 'datetime',
    ];

    public function habilidad()
    {
        return $this->belongsTo(\App\Models\Habilidad::class, 'habilidad_id');
    }


    public function disponibilidad()
    {
        return $this->belongsTo(Disponibilidad::class, 'disponibilidad_id');
    }
    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }
    public function alumno()
    {
        return $this->belongsTo(User::class, 'alumno_id');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($reserva) {
            if ($reserva->estado === 'confirmada' && !$reserva->meeting_id) {
                $reserva->meeting_id = 'meet-' . time() . '-' . Str::random(6);
            }
        });
    }

    // Método para obtener el enlace de la reunión
    public function getMeetingLinkAttribute()
    {
        return url("/meeting/{$this->meeting_id}");
    }
}
