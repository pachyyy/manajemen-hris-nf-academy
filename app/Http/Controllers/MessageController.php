<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        return Message::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'user_id' => 'required', // can be 'all' or a user ID
        ]);

        if ($request->user_id === 'all') {
            $users = User::where('role_id', 3)->get(); // Assuming 3 is staff
            foreach ($users as $user) {
                Message::create([
                    'user_id' => $user->id,
                    'title' => $request->title,
                    'body' => $request->body,
                ]);
            }
        } else {
            Message::create([
                'user_id' => $request->user_id,
                'title' => $request->title,
                'body' => $request->body,
            ]);
        }

        return redirect()->back()->with('success', 'Message sent successfully');
    }

    public function markAsRead(Message $message)
    {
        if ($message->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $message->update(['read_at' => now()]);
        return response()->json(['message' => 'Message marked as read']);
    }

    public function markAllAsRead()
    {
        Message::where('user_id', Auth::id())->whereNull('read_at')->update(['read_at' => now()]);
        return response()->json(['message' => 'All messages marked as read']);
    }

    public function unreadCount()
    {
        $count = Message::where('user_id', Auth::id())->whereNull('read_at')->count();
        return response()->json(['count' => $count]);
    }
}
