<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;
use App\Models\Reserva;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;
use Barryvdh\DomPDF\Facade\Pdf;


class AdminReportsController extends Controller
{
    public function sessionReport(Request $request, Reserva $reserva)
    {
        try {
            $format = $request->query('format', 'html');

            // 1) Calls + metrics (robusto a nombre de columna)
            $linked   = false;
            $callQuery = DB::table('calls')->orderBy('id');

            if (Schema::hasColumn('calls', 'reserva_id')) {
                $callQuery->where('reserva_id', $reserva->id);
                $linked = true;
            } elseif (Schema::hasColumn('calls', 'reservaId')) {
                $callQuery->where('reservaId', $reserva->id);
                $linked = true;
            } elseif (Schema::hasColumn('calls', 'meeting_id') && !empty($reserva->meeting_id)) {
                $callQuery->where('meeting_id', $reserva->meeting_id);
                $linked = true;
            } else {
                Log::warning('calls: no link column found', [
                    'available_columns' => Schema::getColumnListing('calls'),
                    'reserva_id' => $reserva->id,
                    'meeting_id' => $reserva->meeting_id,
                ]);
            }

            $calls = $linked ? $callQuery->get() : collect();  // ← si no hay columna, no traemos nada
            $callIds = $calls->pluck('id')->all();

            $metrics = empty($callIds)
                ? collect()
                : DB::table('call_metrics')
                ->whereIn('call_id', $callIds)
                ->orderBy('created_at')
                ->get();

            // 2) Fechas robustas
            $startedAt = $reserva->meeting_started_at ?? $reserva->created_at;
            $endedAt   = $reserva->meeting_ended_at   ?? $reserva->updated_at;

            $started = $startedAt ? Carbon::parse($startedAt) : null;
            $ended   = $endedAt   ? Carbon::parse($endedAt)   : null;

            $durMin = 0;
            if ($started && $ended) {
                $durMin = round($started->diffInSeconds($ended) / 60, 2);
            }

            $avg = function (string $f) use ($metrics) {
                $v = $metrics->avg($f);
                return $v ? round($v, 2) : 0;
            };

            $stats = [
                'inicio'        => $started ? $started->format('Y-m-d H:i:s') : null,
                'fin'           => $ended   ? $ended->format('Y-m-d H:i:s')   : null,
                'duracion_min'  => $durMin,
                'prom_fps'      => $avg('fps'),
                'prom_jitter'   => $avg('jitter'),
                'prom_latency'  => $avg('latency'),
                'prom_loss'     => $avg('packets_lost'),
            ];

            // 3) Formatos
            if ($format === 'csv') {
                $csv = $this->renderCsv($reserva, $metrics, $stats);
                return Response::make($csv, 200, [
                    'Content-Type'        => 'text/csv; charset=UTF-8',
                    'Content-Disposition' => 'attachment; filename="reporte-sesion-' . $reserva->id . '.csv"',
                ]);
            }

            $html = $this->renderHtml($reserva, $metrics, $stats);

            if ($format === 'pdf') {
                try {
                    // PDF real
                    return Pdf::loadHTML($html)
                        ->setPaper('a4', 'portrait')
                        ->stream('reporte-sesion-' . $reserva->id . '.pdf'); // o ->download(...)
                } catch (\Throwable $e) {
                    // Fallback a HTML si DomPDF falla (no corta el flujo)
                    Log::warning('PDF fallback to HTML', ['reserva_id' => $reserva->id, 'msg' => $e->getMessage()]);
                    return Response::make($html, 200, ['Content-Type' => 'text/html; charset=UTF-8']);
                }
            }

            // HTML por defecto
            return Response::make($html, 200, ['Content-Type' => 'text/html; charset=UTF-8']);


            // HTML (si después activás DomPDF podés convertir este HTML a PDF)
            $html = $this->renderHtml($reserva, $metrics, $stats);
            return Response::make($html, 200, ['Content-Type' => 'text/html; charset=UTF-8']);
        } catch (\Throwable $e) {
            Log::error('Reporte sesión error', [
                'reserva_id' => $reserva->id ?? null,
                'msg'        => $e->getMessage(),
                'trace'      => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    protected function renderHtml(Reserva $reserva, $metrics, array $stats): string
    {
        $html  = '<!doctype html><html><head><meta charset="utf-8">';
        $html .= '<title>Reporte Sesión #' . $reserva->id . '</title>';
        $html .= '<style>
            body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,sans-serif;padding:24px;background:#f7f7fb}
            h1{margin:0 0 16px}
            .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:12px 0}
            table{width:100%;border-collapse:collapse;margin-top:8px}
            th,td{border:1px solid #e5e7eb;padding:8px;text-align:left;font-size:14px}
            th{background:#f3f4f6}
            small{color:#6b7280}
        </style></head><body>';

        $html .= '<h1>Reporte de Sesión #' . $reserva->id . '</h1>';

        $html .= '<div class="card"><strong>Resumen</strong>';
        $html .= '<div>Inicio: '    . ($stats['inicio']        ?? '-') . '</div>';
        $html .= '<div>Fin: '       . ($stats['fin']           ?? '-') . '</div>';
        $html .= '<div>Duración: '  . ($stats['duracion_min']  ?? 0)   . ' min</div>';
        $html .= '<div>Estado: '    . e($reserva->estado ?? '-') . '</div>';
        $html .= '</div>';

        $html .= '<div class="card"><strong>Promedios</strong>';
        $html .= '<div>FPS: '       . $stats['prom_fps']      . '</div>';
        $html .= '<div>Jitter: '    . $stats['prom_jitter']   . ' ms</div>';
        $html .= '<div>Latencia: '  . $stats['prom_latency']  . ' ms</div>';
        $html .= '<div>Pérdida: '   . $stats['prom_loss']     . ' %</div>';
        $html .= '<small>Muestras: ' . count($metrics) . '</small>';
        $html .= '</div>';

        $html .= '<div class="card"><strong>Métricas crudas (' . count($metrics) . ')</strong>';
        $html .= '<table><thead><tr>
                    <th>#</th><th>FPS</th><th>Loss %</th><th>Jitter</th><th>Latencia</th><th>Timestamp</th>
                  </tr></thead><tbody>';

        $i = 1;
        foreach ($metrics as $m) {
            $html .= '<tr>'
                .  '<td>' . ($i++) . '</td>'
                .  '<td>' . (string)($m->fps           ?? 0) . '</td>'
                .  '<td>' . (string)($m->packets_lost  ?? 0) . '</td>'
                .  '<td>' . (string)($m->jitter        ?? 0) . '</td>'
                .  '<td>' . (string)($m->latency       ?? 0) . '</td>'
                .  '<td>' . e($m->created_at) . '</td>'
                .  '</tr>';
        }

        $html .= '</tbody></table></div>';
        $html .= '</body></html>';

        return $html;
    }

    protected function renderCsv(Reserva $reserva, $metrics, array $stats): string
    {
        $out = [];
        $out[] = 'reserva_id,inicio,fin,duracion_min,avg_fps,avg_jitter,avg_latency,avg_loss';
        $out[] = implode(',', [
            $reserva->id,
            '"' . ($stats['inicio'] ?? '') . '"',
            '"' . ($stats['fin']    ?? '') . '"',
            $stats['duracion_min'] ?? 0,
            $stats['prom_fps'],
            $stats['prom_jitter'],
            $stats['prom_latency'],
            $stats['prom_loss'],
        ]);
        $out[] = '';
        $out[] = 'fps,loss,jitter,latency,created_at';
        foreach ($metrics as $m) {
            $out[] = implode(',', [
                (string)($m->fps          ?? 0),
                (string)($m->packets_lost ?? 0),
                (string)($m->jitter       ?? 0),
                (string)($m->latency      ?? 0),
                '"' . ($m->created_at ?? '') . '"',
            ]);
        }
        return implode("\n", $out) . "\n";
    }
}
