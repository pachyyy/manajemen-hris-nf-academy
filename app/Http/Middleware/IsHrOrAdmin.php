<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsHrOrAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is Admin (role_id = 1) or HR (role_id = 2)
        if ($request->user() && in_array($request->user()->role_id, [1, 2])) {
            return $next($request);
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }
}
