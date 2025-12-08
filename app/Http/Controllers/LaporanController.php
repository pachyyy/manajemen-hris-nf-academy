<?php

namespace App\Http\Controllers;

use App\Models\Laporan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LaporanController extends Controller
{
    public function indexAdmin()
    {
        return Laporan::with('user')->latest()->get();
    }

    public function indexStaff()
    {
        return Auth::user()->laporans()->latest()->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'isi_laporan' => 'required|string',
        ]);

        $laporan = Auth::user()->laporans()->create($request->all());

        return response()->json($laporan, 201);
    }

    public function show(Laporan $laporan)
    {
        $this->authorize('view', $laporan);
        return $laporan;
    }

    public function update(Request $request, Laporan $laporan)
    {
        $this->authorize('update', $laporan);

        if ($laporan->status === 'accepted') {
            return response()->json(['message' => 'Cannot update an accepted report.'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'isi_laporan' => 'required|string',
        ]);

        $laporan->update($request->all());

        return response()->json($laporan);
    }

    public function destroy(Laporan $laporan)
    {
        $this->authorize('delete', $laporan);

        if ($laporan->status === 'accepted') {
            return response()->json(['message' => 'Cannot delete an accepted report.'], 403);
        }

        $laporan->delete();

        return response()->json(null, 204);
    }

    public function accept(Laporan $laporan)
    {
        $this->authorize('accept', $laporan);
        $laporan->update(['status' => 'accepted']);
        return response()->json($laporan);
    }

    public function decline(Laporan $laporan)
    {
        $this->authorize('decline', $laporan);
        $laporan->update(['status' => 'declined']);
        return response()->json($laporan);
    }
}