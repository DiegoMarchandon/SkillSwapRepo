<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Favorito;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    /**
     * Agregar profesor a favoritos
     */
    public function store(Request $request): JsonResponse
    {
        
        try {
            // Debug: verificar si el modelo existe
        if (!class_exists('App\Models\Favorito')) {
            return response()->json([
                'success' => false,
                'message' => 'Modelo Favorito no encontrado'
            ], 500);
        }
         // Debug: probar una consulta simple
         $test = \App\Models\Favorito::first();
         // Si esto falla, el problema es el modelo
         
            $request->validate([
                'profesor_id' => 'required|exists:users,id',
                'usuario_habilidad_id' => 'required|exists:usuario_habilidad,id',
            ]);

            // Verificar si ya existe el favorito
            $existingFavorite = Favorito::where('user_id', Auth::id())
            ->where('profesor_id', $request->profesor_id)
            ->first();

            if ($existingFavorite) {
                return response()->json([
                    'success' => false,
                    'message' => 'Este profesor ya está en tus favoritos'
                ], 409);
            }

            $favorite = Favorito::create([
                'user_id' => Auth::id(),
                'profesor_id' => $request->profesor_id,
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
                'message' => 'Error al agregar favorito',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remover profesor de favoritos
     */
    public function destroy(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'profesor_id' => 'required|exists:users,id'
            ]);

            $favorite = Favorito::where('user_id', Auth::id())
                ->where('profesor_id', $request->profesor_id)
                ->first();

            if (!$favorite) {
                return response()->json([
                    'success' => false,
                    'message' => 'Favorito no encontrado'
                ], 404);
            }

            $favorite->delete();

            return response()->json([
                'success' => true,
                'message' => 'Profesor removido de favoritos'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al remover favorito',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener favoritos del usuario autenticado
     */
    public function getUserFavorites(): JsonResponse
    {
        try {
            $favorites = Favorito::with([
                'teacher:id,name,email',
                'teacher.habilidadesOfrecidas.habilidad'
            ])
            ->where('user_id', Auth::id())
            ->get()
            ->map(function($favorite) {
                return [
                    'id' => $favorite->teacher->id,
                    'name' => $favorite->teacher->name,
                    'email' => $favorite->teacher->email,
                    'skills' => $favorite->teacher->habilidadesOfrecidas->map(function($habilidad) {
                        return $habilidad->habilidad->nombre;
                    })->toArray(),
                    'favorite_id' => $favorite->id,
                    'added_at' => $favorite->created_at
                ];
            });

            return response()->json([
                'success' => true,
                'favorites' => $favorites
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener favoritos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar si un profesor está en favoritos
     */
    public function checkFavorite($profesorId): JsonResponse
    {
        try {
            $isFavorite = Favorito::where('user_id', Auth::id())
                ->where('profesor_id', $profesorId)
                ->exists();

            return response()->json([
                'success' => true,
                'is_favorite' => $isFavorite
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar favorito'
            ], 500);
        }
    }

    /**
     * Obtener contador de favoritos por profesor
     */
    public function getFavoritesCount($profesorId): JsonResponse
    {
        try {
            $count = Favorito::where('profesor_id', $profesorId)->count();

            return response()->json([
                'success' => true,
                'favorites_count' => $count
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener contador de favoritos'
            ], 500);
        }
    }
}