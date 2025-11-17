<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\EmployeeController;
use App\Models\Employee;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Routing
Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('dashboard/roles', function() {
        return Inertia::render(component: 'roles/showRoles');
    })->middleware('admin')->name('dashboard.roles');

    // employee routing
    Route::get('dashboard/employees', function() {
        return Inertia::render(component: 'employees/showEmployees');
    })->middleware('admin')->name('dashboard.employees');

    Route::get('dashboard/employees/add', function() {
        return Inertia::render(component: 'employees/addEmployee');
    })->middleware('admin')->name('dashboard.employees.add');

    Route::post('dashboard/employees', [EmployeeController::class, 'store'])->middleware('admin')->name('dashboard.employees.store');

    Route::get('dashboard/employees/update/{id}', function($id) {
        return Inertia::render('employees/updateEmployee', [
            'id' => $id,
        ]);
    })->middleware('admin')->name('dashboard.employees.update');

    Route::get('dashboard/employees/account/{id}', [EmployeeController::class, 'showAccount'])->middleware('admin')->name('dashboard.employees.account');

    Route::get('dashboard/employees/{id}/documents', function($id) {
        return Inertia::render('employees/EmployeeDocuments', [
            'employeeId' => $id
        ]);
    })->middleware('admin')->name('dashboard.employees.documents');

    Route::get('dataPegawai', function () {
        return Inertia::render('dataPegawai');
    })->name('dataPegawai');

    Route::get('dashboard/attendance', function () {

        $user = Auth::user();

        $employee = Employee::where('user_id', $user->id)->firstOrFail();

        return Inertia::render('attendance/staffAttendance', [
            'records' => $employee->attendances()->orderBy('date','desc')->get(),
            'user' => $user,
        ]);
    })->name('dashboard.attendance');

    Route::get('dashboard/attendance/admin', function () {
        return Inertia::render('attendance/adminAttendance');
    })->middleware('admin')->name('attendance.admin');

    Route::get('dashboard/attendance/summary',
        [AttendanceController::class, 'summaryPage']
        )->middleware('admin')
        ->name('dashboard.attendance.summary');

    Route::get('penugasan', function () {
        return Inertia::render('penugasan');
    })->name('penugasan');

    Route::get('evaluasiKerja', function () {
        return Inertia::render('evaluasiKerja');
    })->name('evaluasiKerja');

    Route::get('pelatihan', function () {
        return Inertia::render('pelatihan');
    })->name('pelatihan');

    Route::get('laporan', function () {
        return Inertia::render('laporan');
    })->name('laporan');
});

require __DIR__ . '/settings.php';
