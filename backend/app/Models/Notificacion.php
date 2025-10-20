<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    protected $table = 'notifications';
    protected $fillable = ['user_id', 'tipo', 'data', 'read_at'];
    protected $casts = ['data' => 'array', 'read_at' => 'datetime'];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
