<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;


class User extends Authenticatable
{

    use HasApiTokens, Notifiable;

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relación con las habilidades del usuario
     */
    public function habilidades()
    {
        return $this->hasMany(UsuarioHabilidad::class, 'user_id');
    }

    /**
     * Obtener solo habilidades ofrecidas y activas
     */
    public function habilidadesOfrecidas()
    {
        return $this->hasMany(UsuarioHabilidad::class, 'user_id')
                    ->where('tipo', 'ofrecida')
                    ->where('estado', 'activa');
    }

    /**
     * Favoritos que el usuario ha agregado
     */
    public function favoritos()
    {
        return $this->hasMany(Favorito::class, 'user_id');
    }

    /**
     * Profesores que el usuario tiene como favoritos
     */
    public function profesoresFavoritos()
    {
        return $this->hasManyThrough(
            User::class,
            Favorito::class,
            'user_id', // Foreign key on Favoritos table
            'id', // Foreign key on Users table (profesor)
            'id', // Local key on Users table
            'profesor_id' // Local key on Favoritos table
        );
    }

    /**
     * Veces que este usuario ha sido marcado como favorito (como profesor)
     */
    public function favoritosRecibidos()
    {
        return $this->hasMany(Favorito::class, 'profesor_id');
    }

        /**
     * Relación: Llamadas donde el usuario es el caller (instructor)
     */
    public function callsAsCaller()
    {
        return $this->hasMany(Call::class, 'caller_id');
    }

    /**
     * Relación: Llamadas donde el usuario es el receiver (estudiante)
     */
    public function callsAsReceiver()
    {
        return $this->hasMany(Call::class, 'receiver_id');
    }

    /**
     * Relación: Todas las llamadas del usuario (como caller o receiver)
     */
    public function allCalls()
    {
        return Call::where('caller_id', $this->id)
            ->orWhere('receiver_id', $this->id);
    }

    /**
     * Relación con habilidades del usuario
     */
    public function skills()
    {
        return $this->belongsToMany(Habilidad::class, 'usuario_habilidad', 'user_id', 'habilidad_id')
            ->withPivot('nivel', 'tipo')
            ->withTimestamps();
    }
}
