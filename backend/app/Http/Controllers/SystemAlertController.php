<?php

namespace App\Http\Controllers;

use App\Models\SystemAlert;
use App\Events\SystemAlertBroadcast;
use Illuminate\Http\Request;

class SystemAlertController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if ($request->user() && $request->user()->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
            return $next($request);
        });
    }

    /**
     * Get all system alerts
     */
    public function index(Request $request)
    {
        $query = SystemAlert::with('resolver:id,surname,first_name');

        // Filter by type
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        // Filter by resolved status
        if ($request->has('resolved')) {
            if ($request->resolved === 'true' || $request->resolved === '1') {
                $query->where('is_resolved', true);
            } else {
                $query->unresolved();
            }
        }

        // Filter by severity
        if ($request->has('severity')) {
            $query->bySeverity($request->severity);
        }

        $alerts = $query->latest()->paginate(20);

        return response()->json([
            'data' => $alerts->items(),
            'pagination' => [
                'current_page' => $alerts->currentPage(),
                'total_pages' => $alerts->lastPage(),
                'total' => $alerts->total(),
            ]
        ]);
    }

    /**
     * Create a new system alert
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:critical,warning,info',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'severity' => 'nullable|integer|min:1|max:5',
            'metadata' => 'nullable|array'
        ]);

        $alert = SystemAlert::create([
            'type' => $request->type,
            'title' => $request->title,
            'message' => $request->message,
            'severity' => $request->severity ?? 1,
            'metadata' => $request->metadata
        ]);

        // Broadcast alert to all connected admins in real-time
        broadcast(new SystemAlertBroadcast($alert))->toOthers();

        return response()->json([
            'message' => 'Alert created successfully',
            'alert' => $alert
        ], 201);
    }

    /**
     * Resolve an alert
     */
    public function resolve($id)
    {
        $alert = SystemAlert::findOrFail($id);
        
        if ($alert->is_resolved) {
            return response()->json(['message' => 'Alert already resolved'], 400);
        }

        $alert->resolve(auth()->id());

        return response()->json([
            'message' => 'Alert resolved successfully',
            'alert' => $alert->fresh('resolver')
        ]);
    }

    /**
     * Get unresolved alerts count
     */
    public function unresolvedCount()
    {
        return response()->json([
            'count' => SystemAlert::unresolved()->count(),
            'critical' => SystemAlert::unresolved()->critical()->count(),
            'warning' => SystemAlert::unresolved()->byType('warning')->count(),
            'info' => SystemAlert::unresolved()->byType('info')->count(),
        ]);
    }

    /**
     * Get latest unresolved alerts
     */
    public function unresolved()
    {
        $alerts = SystemAlert::unresolved()
            ->orderBy('severity', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json(['alerts' => $alerts]);
    }

    /**
     * Delete an alert
     */
    public function destroy($id)
    {
        $alert = SystemAlert::findOrFail($id);
        $alert->delete();

        return response()->json(['message' => 'Alert deleted successfully']);
    }
}
