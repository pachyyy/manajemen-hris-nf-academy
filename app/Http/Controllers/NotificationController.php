<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Notification/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function markAsRead(Notification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            abort(403);
        }

        $notification->update(['read_at' => now()]);

        return back();
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return back();
    }
}
