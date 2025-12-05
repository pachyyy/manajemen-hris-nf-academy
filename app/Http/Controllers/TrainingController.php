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

        if ($user) {
            $registeredTrainingIds = TrainingParticipants::where('user_id', $user->id)
                ->whereIn('training_id', $trainings->pluck('id'))
                ->pluck('training_id')
                ->flip();

            $trainings->each(function ($training) use ($registeredTrainingIds) {
                $training->is_registered = isset($registeredTrainingIds[$training->id]);
            });
        }

        return Inertia::render('pelatihan', [
            'trainings' => $trainings,
            'canManage' => in_array(strtolower(optional($user->role)->name), ['admin', 'hr']),
        ]);
    }

    public function create()
    {
        // Cocok dengan pelatihanCreate.tsx
        return Inertia::render('pelatihanCreate');
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

        $training = Training::create($data);

        event(new \App\Events\TrainingCreated($training));

        // Balik ke halaman /pelatihan
        return redirect()->route('pelatihan')->with('success', 'Training created successfully.');
    }

    public function edit(Training $training)
    {
        // Cocok dengan pelatihanEdit.tsx (props: training)
        return Inertia::render('pelatihanEdit', [
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

        return redirect()->route('pelatihan')->with('success', 'Training updated successfully.');
    }

    public function destroy(Training $training)
    {
        $training->delete();

        return redirect()->route('pelatihan')->with('success', 'Training deleted successfully.');
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

    // ==== Peserta Pelatihan (untuk halaman pelatihanParticipants.tsx) ====

    public function participants(Training $training)
    {
        // Ambil peserta + user, lalu map ke bentuk yang React butuh
        $participants = $training->participants()
            ->with('user')
            ->get()
            ->map(function ($p) {
                return [
                    'id'                => $p->id,
                    'user_id'           => $p->user_id,
                    'name'              => $p->user->name ?? '',
                    'email'             => $p->user->email ?? '',
                    'attendance_status' => $p->attendance_status,
                ];
            });

        return Inertia::render('pelatihanParticipants', [
            'training'     => $training,
            'participants' => $participants,
        ]);
    }

    public function updateAttendance(Request $request, Training $training)
    {
        $data = $request->validate([
            'participants'                     => 'required|array',
            'participants.*.id'                => 'required|integer|exists:training_participants,id',
            'participants.*.attendance_status' => 'required|in:present,absent,late',
        ]);

        foreach ($data['participants'] as $item) {
            TrainingParticipants::where('id', $item['id'])
                ->update(['attendance_status' => $item['attendance_status']]);
        }

        return back()->with('success', 'Attendance updated.');
    }

    // ==== Hasil Pelatihan (untuk pelatihanResults.tsx) ====

    public function results(Training $training)
    {
        $participants = $training->participants()->with('user')->get();
        $results      = $training->results()->get()->keyBy('user_id');

        // Bentuk rows sesuai interface di pelatihanResults.tsx
        $rows = $participants->map(function ($p) use ($results) {
            $result = $results->get($p->user_id);

            return [
                'user_id'        => $p->user_id,
                'name'           => $p->user->name ?? '',
                'score'          => $result->score ?? null,
                'status'         => $result->status ?? null,
                'notes'          => $result->notes ?? null,
                'certificate_url'=> $result->certificate_url ?? null, // kalau kolom ini belum ada, akan null
            ];
        })->values();

        return Inertia::render('pelatihanResults', [
            'training' => $training,
            'rows'     => $rows,
        ]);
    }

    public function storeResults(Request $request, Training $training)
    {
        $data = $request->validate([
            'results'           => 'required|array',
            'results.*.user_id' => 'required|integer|exists:users,id',
            'results.*.score'   => 'nullable|integer|min:0|max:100',
            'results.*.status'  => 'nullable|in:pass,fail',
            'results.*.notes'   => 'nullable|string',
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
