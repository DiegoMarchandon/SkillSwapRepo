<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notificacion;

class NotificacionesController extends Controller
{
    public function index(Request $r)
    {
        $items = Notificacion::where('user_id', $r->user()->id)
            ->orderByDesc('id')->paginate(20);
        return response()->json($items);
    }
    public function unreadCount(Request $r)
    {
        $c = Notificacion::where('user_id', $r->user()->id)
            ->whereNull('read_at')->count();
        return response()->json(['count' => $c]);
    }
    public function latest(Request $r)
    {
        $since = $r->query('since');
        $q = Notificacion::where('user_id', $r->user()->id);
        if ($since) {
            $q->where('created_at', '>', $since);
        }
        return response()->json($q->orderBy('id', 'desc')->take(20)->get());
    }
    public function markRead(Request $r, int $id)
    {
        $n = Notificacion::where('user_id', $r->user()->id)->findOrFail($id);
        if (!$n->read_at) $n->read_at = now();
        $n->save();
        return response()->json(['ok' => true]);
    }
    public function markAllRead(Request $r)
    {
        Notificacion::where('user_id', $r->user()->id)->whereNull('read_at')
            ->update(['read_at' => now()]);
        return response()->json(['ok' => true]);
    }
}
