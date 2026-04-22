<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class AuditLogController extends Controller
{
    /**
     * Get all audit logs with filters
     */
    public function index(Request $request)
    {
        $query = AuditLog::with('user:id,surname,first_name,email');

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by action
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        // Filter by model type
        if ($request->has('model_type')) {
            $query->where('model_type', 'like', '%' . $request->model_type . '%');
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('surname', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $logs = $query->latest()->paginate(50);

        return response()->json([
            'data' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'total_pages' => $logs->lastPage(),
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
            ]
        ]);
    }

    /**
     * Get a specific audit log
     */
    public function show($id)
    {
        $log = AuditLog::with('user')->findOrFail($id);

        return response()->json([
            'log' => $log,
            'changes' => $log->changes,
            'description' => $log->description
        ]);
    }

    /**
     * Get audit statistics
     */
    public function stats()
    {
        $today = now()->startOfDay();
        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();

        return response()->json([
            'total_logs' => AuditLog::count(),
            'today' => AuditLog::where('created_at', '>=', $today)->count(),
            'this_week' => AuditLog::where('created_at', '>=', $thisWeek)->count(),
            'this_month' => AuditLog::where('created_at', '>=', $thisMonth)->count(),
            'by_action' => AuditLog::selectRaw('action, COUNT(*) as count')
                ->groupBy('action')
                ->get(),
            'by_model' => AuditLog::selectRaw('model_type, COUNT(*) as count')
                ->groupBy('model_type')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
            'top_users' => AuditLog::with('user:id,surname,first_name')
                ->selectRaw('user_id, COUNT(*) as count')
                ->groupBy('user_id')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get()
        ]);
    }

    /**
     * Export audit logs
     */
    public function export(Request $request)
    {
        $format = $request->query('format', 'csv');
        
        $query = AuditLog::with('user:id,surname,first_name,email');

        // Apply same filters as index
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }
        if ($request->has('model_type')) {
            $query->where('model_type', 'like', '%' . $request->model_type . '%');
        }
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        }

        $logs = $query->latest()->get();

        if ($format === 'csv') {
            return $this->exportCsv($logs);
        }

        return response()->json(['message' => 'Format not supported'], 400);
    }

    /**
     * Export logs as CSV
     */
    private function exportCsv($logs)
    {
        $filename = 'audit_logs_' . now()->format('Y-m-d_His') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($logs) {
            $file = fopen('php://output', 'w');
            
            // Headers
            fputcsv($file, ['ID', 'User', 'Email', 'Action', 'Model', 'Model ID', 'IP Address', 'Date']);

            // Data
            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->user ? $log->user->first_name . ' ' . $log->user->surname : 'N/A',
                    $log->user ? $log->user->email : 'N/A',
                    $log->action,
                    class_basename($log->model_type),
                    $log->model_id,
                    $log->ip_address,
                    $log->created_at->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }
}
