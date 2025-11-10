<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    public function register(Request $r)
    {
        $data = $r->validate([
            'name'     => ['required', 'string', 'max:100'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'avatar' => ['nullable','string']
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // Si viene el avatar, guardarlo como archivo
        if (!empty($data['avatar'])) { // verifica si el frontend envió algo en el campo avatar.
            $imageData = base64_decode($data['avatar']); // el avatar que llega desde el frontend es un string en formato Base64. Esta línea lo convierte nuevamente en datos binarios
            $fileName = "avatars/user_{$user->id}.svg"; // se crea un nombre para guardarlo e identificar a qué usuario pertenece.
            Storage::disk('public')->put($fileName, $imageData); // guarda físicamente el archivo en nuestro servidor.
            $user->avatar_path = "/storage/{$fileName}"; // Guardamos en la BD la ruta pública del archivo.
            $user->save(); // Actualiza la fila en la base de datos para guardar esa ruta.
        }

        $token = $user->createToken('web')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token], 201);
    }

    public function login(Request $r)
    {
        $data = $r->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $data['email'])->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        $token = $user->createToken('web')->plainTextToken;
        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function logout(Request $r)
    {
        $r->user()->currentAccessToken()?->delete();
        return response()->json(['ok' => true]);
    }
}
