<?php

namespace App\Http\Controllers;

use App\Models\Training;
use App\Models\TrainingParticipants;
use App\Models\TrainingResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TrainingController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $trainings = Training::withCount('participants')
            ->orderBy('start_time', 'desc')
            ->get();

        return Inertia::render('Training/Index', [
            'trainings' => $trainings,
            'userRole'  => $user->role ?? null,
        ]);
    }

    public function create()
    {
        return Inertia::render('Training/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'trainer_name' => 'nullable|string|max:255',
            'type'         => 'required|in:online,offline',
            'start_time'   => 'required|date',
            'end_time'     => 'required|date|after_or_equal:start_time',
            'location'     => 'nullable|string|max:255',
            'quota'        => 'nullable|integer|min:1',
            'status'       => 'required|in:draft,open,ongoing,completed,cancelled',
        ]);

        $data['created_by'] = Auth::id();

        Training::create($data);

        return redirect()->route('trainings.index')->with('success', 'Training created successfully.');
    }

    public function edit(Training $training)
    {
        return Inertia::render('Training/Edit', [
            'training' => $training,
        ]);
    }

    public function update(Request $request, Training $training)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'trainer_name' => 'nullable|string|max:255',
            'type'         => 'required|in:online,offline',
            'start_time'   => 'required|date',
            'end_time'     => 'required|date|after_or_equal:start_time',
            'location'     => 'nullable|string|max:255',
            'quota'        => 'nullable|integer|min:1',
            'status'       => 'required|in:draft,open,ongoing,completed,cancelled',
        ]);

        $training->update($data);

        return redirect()->route('trainings.index')->with('success', 'Training updated successfully.');
    }

    public function destroy(Training $training)
    {
        $training->delete();

        return redirect()->route('trainings.index')->with('success', 'Training deleted successfully.');
    }

    // ==== Registrasi Peserta ====

    public function register(Training $training)
    {
        TrainingParticipants::firstOrCreate(
            [
                'training_id' => $training->id,
                'user_id'     => Auth::id(),
            ],
            [
                'status'        => 'registered',
                'registered_at' => now(),
            ]
        );

        return back()->with('success', 'Registered to training.');
    }

    public function cancelRegistration(Training $training)
    {
        TrainingParticipants::where('training_id', $training->id)
            ->where('user_id', Auth::id())
            ->delete();

        return back()->with('success', 'Registration cancelled.');
    }

    public function participants(Training $training)
    {
        $participants = $training->participants()->with('user')->get();

        return Inertia::render('Training/Participants', [
            'training'     => $training,
            'participants' => $participants,
        ]);
    }

    public function updateAttendance(Request $request, Training $training)
    {
        $data = $request->validate([
            'participants'                        => 'required|array',
            'participants.*.id'                   => 'required|integer|exists:training_participants,id',
            'participants.*.attendance_status'    => 'required|in:present,absent,late',
        ]);

        foreach ($data['participants'] as $item) {
            TrainingParticipants::where('id', $item['id'])
                ->update(['attendance_status' => $item['attendance_status']]);
        }

        return back()->with('success', 'Attendance updated.');
    }

    // ==== Hasil Pelatihan ====

    public function results(Training $training)
    {
        $participants = $training->participants()->with('user')->get();
        $results      = $training->results()->with('user')->get();

        return Inertia::render('Training/Results', [
            'training'     => $training,
            'participants' => $participants,
            'results'      => $results,
        ]);
    }

    public function storeResults(Request $request, Training $training)
    {
        $data = $request->validate([
            'results'               => 'required|array',
            'results.*.user_id'     => 'required|integer|exists:users,id',
            'results.*.score'       => 'nullable|integer|min:0|max:100',
            'results.*.status'      => 'nullable|in:pass,fail',
            'results.*.notes'       => 'nullable|string',
        ]);

        foreach ($data['results'] as $item) {
            TrainingResult::updateOrCreate(
                [
                    'training_id' => $training->id,
                    'user_id'     => $item['user_id'],
                ],
                [
                    'score'  => $item['score'] ?? null,
                    'status' => $item['status'] ?? null,
                    'notes'  => $item['notes'] ?? null,
                ]
            );
        }

        return back()->with('success', 'Training results saved.');
    }
}
