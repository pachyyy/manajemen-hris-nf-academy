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

    Route::get('penugasan', [App\Http\Controllers\TaskController::class, 'index'])->name('penugasan');

    // Task Management Routes
    Route::prefix('tasks')->group(function () {
        // Routes only for Admin and HR (must come before wildcard routes)
        Route::middleware('hr.or.admin')->group(function () {
            Route::get('/create', [App\Http\Controllers\TaskController::class, 'create'])->name('tasks.create');
            Route::post('/', [App\Http\Controllers\TaskController::class, 'store'])->name('tasks.store');
            Route::get('/{task}/edit', [App\Http\Controllers\TaskController::class, 'edit'])->name('tasks.edit');
            Route::put('/{task}', [App\Http\Controllers\TaskController::class, 'update'])->name('tasks.update');
            Route::delete('/{task}', [App\Http\Controllers\TaskController::class, 'destroy'])->name('tasks.destroy');
        });

        // Routes accessible by all authenticated users
        Route::get('/', [App\Http\Controllers\TaskController::class, 'index'])->name('tasks.index');
        Route::get('/{task}', [App\Http\Controllers\TaskController::class, 'show'])->name('tasks.show');
        Route::post('/{task}/status', [App\Http\Controllers\TaskController::class, 'updateStatus'])->name('tasks.updateStatus');
    });

    // Evaluation Period Management Routes (Admin/HR only) - View Only
    Route::prefix('evaluation-periods')->middleware('hr.or.admin')->group(function () {
        Route::get('/', [App\Http\Controllers\EvaluationPeriodController::class, 'index'])->name('evaluation-periods.index');
        Route::get('/{period}', [App\Http\Controllers\EvaluationPeriodController::class, 'show'])->name('evaluation-periods.show');
        Route::get('/{period}/criteria', [App\Http\Controllers\EvaluationCriteriaController::class, 'index'])->name('evaluation-periods.criteria.index');
    });

    // Penilaian Kerja - View Only (Admin/HR only)
    Route::middleware('hr.or.admin')->group(function () {
        Route::get('/penilaian-kerja', function () {
            return redirect()->route('evaluation-periods.index');
        })->name('penilaian-kerja.index');
        
        Route::get('/penilaian-kerja/create', [App\Http\Controllers\EvaluationPeriodController::class, 'createUnified'])->name('penilaian-kerja.create');
    });

    // Evaluation Routes - View Only
    Route::prefix('evaluations')->group(function () {
        // Routes for Admin/HR
        Route::middleware('hr.or.admin')->group(function () {
            Route::get('/', [App\Http\Controllers\EvaluationController::class, 'index'])->name('evaluations.index');
        });

        // Routes for all authenticated users
        Route::get('/self-assessment', [App\Http\Controllers\EvaluationController::class, 'selfAssessmentList'])->name('evaluations.self-assessment.list');
        Route::get('/self-assessment/{period}', [App\Http\Controllers\EvaluationController::class, 'selfAssessmentForm'])->name('evaluations.self-assessment.form');
        Route::get('/results', [App\Http\Controllers\EvaluationController::class, 'results'])->name('evaluations.results');
        Route::get('/{evaluation}', [App\Http\Controllers\EvaluationController::class, 'show'])->name('evaluations.show');
    });

    Route::get('evaluasiKerja', function () {
        $user = Auth::user();
        
        // Admin/HR redirect to penilaian kerja index
        if ($user->role_id == 1 || $user->role_id == 2) {
            return redirect()->route('penilaian-kerja.index');
        }
        
        // Employee redirect to self-assessment
        return redirect()->route('evaluations.self-assessment.list');
    })->name('evaluasiKerja');

    Route::get('pelatihan', function () {
        return Inertia::render('pelatihan');
    })->name('pelatihan');

    Route::get('laporan', function () {
        return Inertia::render('laporan');
    })->name('laporan');
});

require __DIR__ . '/settings.php';
