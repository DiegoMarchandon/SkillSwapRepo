<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CallMetric extends Model
{
    protected $fillable = [
        'call_id',
        'user_id',
        'timestamp',
        'bytes_sent',
        'bytes_received',
        'fps',
        'latency',
        'packets_lost',
        'jitter'
    ];

    public function call()
    {
        return $this->belongsTo(Call::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
