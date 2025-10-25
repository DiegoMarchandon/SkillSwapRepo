<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /* ---------- ADMIN helper ---------- */
    public function getIsAdminAttribute(): bool
    {
        $role = $this->rol ?? $this->role ?? null;   // soporta 'rol' o 'role'
        return strtolower((string) $role) === 'admin';
    }

    /* ---------- Relaciones que ya tenías ---------- */
    public function habilidades()
    {
        return $this->hasMany(UsuarioHabilidad::class, 'user_id');
    }

    public function habilidadesOfrecidas()
    {
        return $this->hasMany(UsuarioHabilidad::class, 'user_id')
            ->where('tipo', 'ofrecida')
            ->where('estado', 'activa');
    }

    public function favoritos()
    {
        return $this->hasMany(Favorito::class, 'user_id');
    }

    public function profesoresFavoritos()
    {
        return $this->hasManyThrough(
            User::class,
            Favorito::class,
            'user_id',
            'id',
            'id',
            'profesor_id'
        );
    }

    public function favoritosRecibidos()
    {
        return $this->hasMany(Favorito::class, 'profesor_id');
    }

    public function callsAsCaller()
    {
        return $this->hasMany(Call::class, 'caller_id');
    }

    public function callsAsReceiver()
    {
        return $this->hasMany(Call::class, 'receiver_id');
    }

    public function allCalls()
    {
        return Call::where('caller_id', $this->id)
            ->orWhere('receiver_id', $this->id);
    }

    public function skills()
    {
        return $this->belongsToMany(Habilidad::class, 'usuario_habilidad', 'user_id', 'habilidad_id')
            ->withPivot('nivel', 'tipo')
            ->withTimestamps();
    }
}
