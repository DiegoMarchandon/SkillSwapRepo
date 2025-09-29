<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function update(Request $r)
    {
        $user = $r->user();

        $data = $r->validate([
            'name'  => ['required', 'string', 'max:100'],
            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($user->id)
            ],
            // avatar es opcional
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        // actualizar campos básicos
        $user->fill([
            'name'  => $data['name'],
            'email' => $data['email'],
        ]);

        // si vino avatar, guardarlo en storage/public/avatars
        if ($r->hasFile('avatar')) {
            $path = $r->file('avatar')->store('avatars', 'public');

            // borrar avatar anterior si existía
            if ($user->avatar_path) {
                @unlink(public_path('storage/' . $user->avatar_path));
            }

            $user->avatar_path = $path;
        }

        $user->save();

        return response()->json([
            'user' => $user->only(['id', 'name', 'email', 'avatar_path'])
            // 'avatar_url' => $user->avatar_path ? url('storage/' . $user->avatar_path) : null,
        ]);
    }

    public function updatePassword(Request $r)
    {
        $r->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = $r->user();
        $user->password = Hash::make($r->input('password'));
        $user->save();

        // opcional: cerrar otros tokens
        // $user->tokens()->where('id', '!=', $r->user()->currentAccessToken()->id)->delete();

        return response()->json(['ok' => true]);
    }
}
