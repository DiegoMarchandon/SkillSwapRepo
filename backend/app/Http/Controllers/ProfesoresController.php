<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Habilidad;
use App\Models\Favorito;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProfesoresController extends Controller
{
    public function searchTeachers(Request $request): JsonResponse
    {
        try {
            $searchTerm = $request->get('q', '');
            
            // Buscar usuarios que ofrezcan al menos una habilidad
            $teachers = User::with(['habilidades' => function($query) {
                    $query->where('tipo', 'ofrecida')
                          ->where('estado', 'activa');
                }])
                ->whereHas('habilidades', function($query) use ($searchTerm) {
                    $query->where('tipo', 'ofrecida')
                          ->where('estado', 'activa')
                          ->when($searchTerm, function($q) use ($searchTerm) {
                              $q->where(function($subQuery) use ($searchTerm) {
                                  $subQuery->whereHas('habilidad', function($habQuery) use ($searchTerm) {
                                      $habQuery->where('nombre', 'LIKE', "%{$searchTerm}%")
                                               ->orWhere('descripcion', 'LIKE', "%{$searchTerm}%");
                                  })
                                  ->orWhere('nivel', 'LIKE', "%{$searchTerm}%");
                              });
                          });
                })
                ->when($searchTerm, function($query) use ($searchTerm) {
                    $query->orWhere('name', 'LIKE', "%{$searchTerm}%")
                          ->orWhere('email', 'LIKE', "%{$searchTerm}%");
                })
                ->get()
                ->where('id', '!=', Auth::id()) // para excluir al usuario actual
                ->map(function($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'skills' => $user->habilidades->map(function($habilidad) {
                            return [
                                'name' => $habilidad->habilidad->nombre,
                                'description' => $habilidad->habilidad->descripcion,
                                'level' => $habilidad->nivel,
                                'type' => $habilidad->tipo
                            ];
                        })->toArray(),
                        'isFavorite' => Favorito::where('user_id', Auth::id())->where('profesor_id', $user->id)->exists(),
                        'favorites_count' => Favorito::where('profesor_id', $user->id)->count(),
                        'has_skills' => $user->habilidades->count() > 0
                    ];
                })
                ->filter(function($user) {
                    // Filtrar solo usuarios que tengan habilidades ofrecidas
                    return $user['has_skills'];
                })
                ->values();

            return response()->json([
                'success' => true,
                'teachers' => $teachers,
                'count' => $teachers->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al buscar profesores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllTeachers(): JsonResponse
    {
        try {
            // Obtener todos los usuarios que ofrecen habilidades
            $teachers = User::with(['habilidades' => function($query) {
                    $query->where('tipo', 'ofrecida')
                          ->where('estado', 1)
                          ->with('habilidad');
                }])
                ->whereHas('habilidades', function($query) {
                    $query->where('tipo', 'ofrecida')
                          ->where('estado', 1);
                })
                ->get()
                ->where('id', '!=', Auth::id()) //para excluir al usuario actual
                ->map(function($user) {

                    // DEBUG - AGREGAR ESTAS LÍNEAS:
                // $userId = Auth::id();
                // \Log::info("User ID: $userId, Profesor ID: {$user->id}");
                
                // $isFavorite = Favorito::where('user_id', $userId)
                //     ->where('profesor_id', $user->id)
                //     ->exists();

                // \Log::info("isFavorite: " . ($isFavorite ? 'true' : 'false'));
                // FIN DEBUG

                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'skills' => $user->habilidades->map(function($habilidad) {
                            return ['name' =>$habilidad->habilidad->nombre,
                                'usuario_habilidad_id' => $habilidad->id
                        ];
                        })->toArray(),
                        'skills_details' => $user->habilidades->map(function($habilidad) {
                            return [
                                'skill_name' => $habilidad->habilidad->nombre,
                                'description' => $habilidad->habilidad->descripcion,
                                'level' => $habilidad->nivel,
                                'type' => $habilidad->tipo
                            ];
                        })->toArray(),
                        'isFavorite' => Favorito::where('user_id', Auth::id())->where('profesor_id', $user->id)->exists(),
                        'favorites_count' => Favorito::where('profesor_id', $user->id)->count()
                    ];
                });

            return response()->json([
                'success' => true,
                'teachers' => $teachers,
                'count' => $teachers->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener profesores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Agregar estos métodos al controlador:

public function addToFavorites(Request $request)
{
    try {
        $request->validate([
            'teacher_id' => 'required|exists:users,id',
            'usuario_habilidad_id' => 'required|exists:usuario_habilidad,id'
        ]);

        $favorite = Favorito::create([
            'user_id' => Auth::id(),
            'profesor_id' => $request->teacher_id,
            'usuario_habilidad_id' => $request->usuario_habilidad_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profesor agregado a favoritos',
            'favorite' => $favorite
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al agregar favorito'
        ], 500);
    }
}

public function removeFromFavorites(Request $request)
{
    try {
        $favorite = Favorito::where('user_id', Auth::id())
            ->where('profesor_id', $request->teacher_id)
            ->first();

        if ($favorite) {
            $favorite->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Profesor removido de favoritos'
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al remover favorito'
        ], 500);
    }
}

public function getFeaturedTeachers()
{
    try {
        $featuredTeachers = User::select('users.*')
            ->addSelect(DB::raw('COUNT(favoritos.id) as favorites_count'))
            ->leftJoin('favoritos', 'users.id', '=', 'favoritos.profesor_id')
            ->whereHas('habilidades', function($query) {
                $query->where('tipo', 'ofrecida')
                      ->where('estado', 'activa');
            })
            ->groupBy('users.id')
            ->orderByDesc('favorites_count')
            ->limit(10)
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'favorites_count' => $user->favorites_count,
                    'skills' => $user->habilidadesOfrecidas->map(function($habilidad) {
                        return $habilidad->habilidad->nombre;
                    })->toArray(),
                    'isFavorite' => Favorito::where('user_id', Auth::id())->where('profesor_id', $user->id)->exists(),
                        'favorites_count' => Favorito::where('profesor_id', $user->id)->count()
                ];
            });

        return response()->json([
            'success' => true,
            'teachers' => $featuredTeachers
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al obtener profesores destacados'
        ], 500);
    }
}

public function getUserFavorites()
{
    try {
        $favorites = Favorito::with(['teacher.habilidadesOfrecidas.habilidad'])
            ->where('user_id', Auth::id())
            ->get()
            ->map(function($favorite) {
                return [
                    'id' => $favorite->teacher->id,
                    'name' => $favorite->teacher->name,
                    'skills' => $favorite->teacher->habilidadesOfrecidas->map(function($habilidad) {
                        return $habilidad->habilidad->nombre;
                    })->toArray(),
                    'favorite_id' => $favorite->id
                ];
            });

        return response()->json([
            'success' => true,
            'favorites' => $favorites
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al obtener favoritos'
        ], 500);
    }
}
}