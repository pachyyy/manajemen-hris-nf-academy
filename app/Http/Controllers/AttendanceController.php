<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    /**
     * Staff, HR dan Admin bisa melihat data absensi.
     * Staff hanya melihat absensinya sendiri.
     * HR & Admin melihat semua absensi.
     */

    public function index() {
        $user = Auth::user();

        if ($user->role->name === 'Staff') {
            // Ambil employee milik user
            $employee = Employee::where('user_id', $user->id)->first();

            $attendances = Attendance::where('employee_id', $employee->id)
                ->orderBy('date', 'desc')
                ->get();
        } else {
            // HR & Admin bisa lihat seluruh attendance
            $attendances = Attendance::with('employee.user')
            ->orderBy('date', 'desc')
            ->get();
        }

        return response()->json($attendances);
    }

    /**
     * Staff Check-In
     */
    public function checkIn(Request $request) {
        $user = Auth::user();

        $employee = Employee::where('user_id', $user->id)->firstOrFail();

        // Cegah double check-in pada hari yg sama
        $existing = Attendance::where('employee_id', $employee->id)
            ->where('date', date('Y-m-d'))
            ->first();

            if ($existing) {
                return response()->json([
                    'message' => 'Anda sudah melakukan check-in hari ini.'
                ], 400);
            }

            $attendance = Attendance::create([
                'employee_id' => $employee->id,
                'date' => date('Y-m-d'),
                'check_in' => now(),
                'status' => 'hadir',
            ]);

            // return response()->json([
            //     'message' => 'Check-in berhasil',
            //     'data' => $attendance,
            // ]);
            return response()->json($attendance, 201);
    }

    /**
     * Staff Check-Out
     */
    public function checkOut(Request $request) {
        $user = Auth::user();
        $employee = Employee::where('user_id', $user->id)->firstOrFail();

        $attendance = Attendance::where('employee_id', $employee->id)
        ->where('date', date('Y-m-d'))
        ->first();

        if (!$attendance) {
            return response()->json([
                'message' => 'Anda belum check-in hari ini.'
            ], 400);
        }

        if ($attendance->check_out) {
            return response()->json([
                'message' => 'Anda sudah check-out hari ini.'
            ], 400);
        }

        $attendance->update([
            'check_out' => now(),
        ]);

        return response()->json([
            'message' => 'Check-out berhasil',
        ]);
    }

    /**
     * Staff ajukan izin atau sakit dengan bukti file
     */
    public function requestLeave(Request $request) {
        $user = Auth::user();
        $employee = Employee::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|in:izin,sakit,cuti',
            'proof_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        // Cegah mengajukan izin jika sudah absen hari ini
        $existing = Attendance::where('employee_id', $employee->id)
            ->where('date', date('Y-m-d'))
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Anda sudah memiliki absensi hari ini.'
            ], 400);
        }

        $path = null;
        if ($request->hasFile('proof_file')) {
            $path = $request->file('proof_file')->store('proofs', 'public');
        }

        $attendance = Attendance::create([
            'employee_id' => $employee->id,
            'date' => date('Y-m-d'),
            'status' => $validated['status'],
            'proof_file' => $path,
        ]);

        return response()->json([
            'message' => 'Pengajuan berhasil',
            'data' => $attendance,
        ]);
    }

    /**
     * HR atau Admin menghapus data absensi
     */
    public function destroy($id) {
        $attendance = Attendance::findOrFail($id);

        if ($attendance->proof_file) {
            Storage::disk('public')->delete($attendance->proof_file);
        }

        $attendance->delete();

        return response()->json([
            'message' => 'Absensi berhasil dihapus'
        ]);
    }

    /**
     * Rekap otomatis ke dashboard Admin
     */
    public function summary() {
        $today = date('Y-m-d');

        // Rekap status hari ini
        $summary = Attendance::where('date', $today)
            ->selectRaw("
                SUM(status = 'hadir') as hadir,
                SUM(status = 'izin') as izin,
                SUM(status = 'sakit') as sakit,
                SUM(status = 'cuti') as cuti,
                SUM(status = 'alpha') as alpha
            ")
            ->first();

            // Total pegawai
            $totalEmployees = Employee::count();

            // Yang absen hari ini
            $absenToday = Attendance::where('date', $today)->count();

            // Belum absen
            $notYet = $totalEmployees - $absenToday;

            return response()->json([
                'today' => $today,
                'summary' => $summary,
                'totalEmployees' => $totalEmployees,
                'alreadyAbsented' => $absenToday,
                'notYetAbsented' => $notYet,
            ]);
    }

    // Inertia Page
    public function summaryPage() {
        $today = date('Y-m-d');

        $totalEmployees = Employee::count();
        $alreadyAbsented = Attendance::where('date', $today)->count();
        $notYetAbsented = $totalEmployees - $alreadyAbsented;

        $summary = [
            'hadir' => Attendance::where('date', $today)->where('status', 'hadir')->count(),
            'izin' => Attendance::where('date', $today)->where('status', 'izin')->count(),
            'sakit' => Attendance::where('date', $today)->where('status', 'sakit')->count(),
            'cuti' => Attendance::where('date', $today)->where('status', 'cuti')->count(),
            'alpha' => Attendance::where('date', $today)->where('status', 'alpha')->count(),
        ];

        return Inertia::render('attendance/adminAttendanceSummary', [
            'today' => $today,
            'summary' => $summary,
            'totalEmployees' => $totalEmployees,
            'alreadyAbsented' => $alreadyAbsented,
            'notYetAbsented' => $notYetAbsented,
        ]);
    }

    // Filter berdasarkan tanggal dan divisi untuk laporan absensi admin
    public function filter(Request $request) {

        $request->validate([
            'date' => 'nullable|date',
            'division' => 'nullable|string'
        ]);

        $query = Attendance::with('employee');

        // Filter tanggal
        if ($request->date) {
            $query->where('date', $request->date);
        }

        // Filter divisi
        if ($request->division) {
            $query->whereHas('employee', function ($q) use ($request) {
                $q->where('division', $request->division);
            });
        }

        return response()->json($query->orderBy('date', 'desc')->get());
    }
}
