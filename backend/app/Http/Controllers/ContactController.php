<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Mail; // si más adelante querés mandar mails

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'  => ['required', 'string', 'max:255'],
            'email'   => ['required', 'email', 'max:255'],
            'asunto'  => ['nullable', 'string', 'max:255'],
            'mensaje' => ['required', 'string'],
        ]);

        $msg = ContactMessage::create($data);

        // Opcional: enviar mail al admin
        // Mail::to(config('mail.from.address'))
        //     ->send(new ContactMessageReceived($msg));

        return response()->json([
            'ok'      => true,
            'message' => 'Mensaje enviado correctamente.',
        ], 201);
    }
}
