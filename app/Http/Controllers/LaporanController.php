<?php

namespace App\Http\Controllers;

use App\Models\Laporan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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

    public function export()
    {
        try {
            $laporans = Laporan::with('user')->get();
            $timestamp = now()->format('Ymd_His');
            $fileName = "laporan_{$timestamp}.csv";
            
            // Save directly to the public disk root
            $fullPath = $fileName;

            $file = fopen(Storage::disk('public')->path($fullPath), 'w');
            $columns = array('ID', 'Title', 'Isi Laporan', 'Status', 'Created By', 'Created At');
            fputcsv($file, $columns);

            foreach ($laporans as $laporan) {
                $row['ID']  = $laporan->id;
                $row['Title']    = $laporan->title;
                $row['Isi Laporan']    = $laporan->isi_laporan;
                $row['Status']  = $laporan->status;
                $row['Created By']  = $laporan->user?->name ?? 'N/A';
                $row['Created At']  = $laporan->created_at;

                fputcsv($file, array($row['ID'], $row['Title'], $row['Isi Laporan'], $row['Status'], $row['Created By'], $row['Created At']));
            }
            fclose($file);

            // Return the public URL to the file
            return response()->json(['download_url' => Storage::disk('public')->url($fullPath)]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Could not create the export file.', 'message' => $e->getMessage()], 500);
        }
    }
}