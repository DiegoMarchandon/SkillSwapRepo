<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsuarioHabilidad extends Model
{
    protected $table = 'usuario_habilidad';

    protected $fillable = [
        'user_id',
        'habilidad_id',
        'tipo',
        'nivel',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function habilidad(): BelongsTo
    {
        return $this->belongsTo(Habilidad::class, 'habilidad_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
