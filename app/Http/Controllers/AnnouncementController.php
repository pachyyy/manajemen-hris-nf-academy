<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Announcement/Index', [
            'announcements' => $announcements,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'      => 'required|string|max:255',
            'type'       => 'required|in:schedule,event,collective_leave,policy',
            'content'    => 'required|string',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
            'audience'   => 'nullable|array',
            'is_pinned'  => 'boolean',
        ]);

        $data['created_by'] = Auth::id();

        Announcement::create($data);

        return redirect()->route('announcements.index')->with('success', 'Announcement created.');
    }

    public function update(Request $request, Announcement $announcement)
    {
        $data = $request->validate([
            'title'      => 'required|string|max:255',
            'type'       => 'required|in:schedule,event,collective_leave,policy',
            'content'    => 'required|string',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
            'audience'   => 'nullable|array',
            'is_pinned'  => 'boolean',
        ]);

        $announcement->update($data);

        return back()->with('success', 'Announcement updated.');
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return back()->with('success', 'Announcement deleted.');
    }
}
