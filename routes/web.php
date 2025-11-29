<?php

use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TrainingController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Routing
Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Route::get('test', function () {
//     return Inertia::render('documents/uploadDocuments');
// })->name('test');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard/admin', function () {
        return Inertia::render('admin-dashboard');
    })->name('dashboard');

    Route::get('dashboard/admin/roles', function() {
        return Inertia::render(component: 'roles/showRoles');
    })->middleware('admin')->name('dashboard.roles');

    // employee routing
    Route::get('dashboard/admin/employees', function() {
        return Inertia::render(component: 'admin/showEmployees');
    })->middleware('admin')->name('dashboard.employees');

    Route::get('dashboard/admin/employees/add', function() {
        return Inertia::render(component: 'admin/addEmployee');
    })->middleware('admin')->name('dashboard.employees.add');

    Route::get('dashboard/admin/employees/update/{id}', function($id) {
        return Inertia::render('admin/updateEmployee', [
            'id' => $id,
        ]);
    })->middleware('admin')->name('dashboard.employees.update');

    Route::get('dashboard/admin/employees/account/{id}', [EmployeeController::class, 'showAccount'])->middleware('admin')->name('dashboard.employees.account');

    Route::get('dashboard/admin/employees/{id}/documents', function($id) {
        return Inertia::render('admin/employeeDocuments', [
            'employeeId' => $id,
        ]);
    })->middleware('admin')->name('dashboard.employees.documents');

    Route::get('documents/{document}', [EmployeeController::class, 'serveDocument'])->middleware('admin')->name('documents.serve');

    Route::get('dashboard/employee/attendance', function () {
        return Inertia::render('attendance/staffAttendance');
    })->name('dashboard.attendance');

    Route::get('dashboard/admin/attendance', function () {
        return Inertia::render('attendance/adminAttendance');
    })->middleware('admin')->name('attendance.admin');

    Route::get('dashboard/admin/attendance/summary', function () {
        return Inertia::render('attendance/adminAttendanceSummary');
    })->middleware('admin')->name('attendance.admin.summary');

    // ===== Task Management =====
    // Route::get('dashboard/admin/task', [TaskController::class, 'index'])->name('task');
    Route::get('dashboard/admin/tasks', [TaskController::class, 'index'])->middleware('admin')->name('tasks.admin');

    Route::prefix('tasks')->group(function () {
        Route::get('/create', [TaskController::class, 'create'])->name('tasks.create');
        Route::post('/', [TaskController::class, 'store'])->name('tasks.store');
        Route::get('/{task}/edit', [TaskController::class, 'edit'])->name('tasks.edit');
        Route::put('/{task}', [TaskController::class, 'update'])->name('tasks.update');
        Route::delete('/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');

        // Routes accessible by all authenticated users
        Route::get('/', [TaskController::class, 'index'])->name('tasks.index');
        Route::get('/{task}', [TaskController::class, 'show'])->name('tasks.show');
        Route::post('/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.updateStatus');
    });

    // ===== Evaluation =====
    Route::get('evaluasiKerja', function () {
        return Inertia::render('evaluasiKerja');
    })->name('evaluasiKerja');

    // ===== Training (Pelatihan) =====
    // Halaman utama pelatihan (URL dan name lama tetap dipakai)
    Route::get('pelatihan', [TrainingController::class, 'index'])->name('pelatihan');

    // Route tambahan untuk manage training
    Route::prefix('trainings')->group(function () {
        // Admin + HR
        Route::middleware('hr.or.admin')->group(function () {
            Route::get('/create', [TrainingController::class, 'create'])->name('trainings.create');
            Route::post('/', [TrainingController::class, 'store'])->name('trainings.store');
            Route::get('/{training}/edit', [TrainingController::class, 'edit'])->name('trainings.edit');
            Route::put('/{training}', [TrainingController::class, 'update'])->name('trainings.update');
            Route::delete('/{training}', [TrainingController::class, 'destroy'])->name('trainings.destroy');

            Route::get('/{training}/participants', [TrainingController::class, 'participants'])->name('trainings.participants');
            Route::post('/{training}/attendance', [TrainingController::class, 'updateAttendance'])->name('trainings.attendance');
            Route::get('/{training}/results', [TrainingController::class, 'results'])->name('trainings.results');
            Route::post('/{training}/results', [TrainingController::class, 'storeResults'])->name('trainings.results.store');
        });

        // Semua user bisa daftar / batal pelatihan
        Route::post('/{training}/register', [TrainingController::class, 'register'])->name('trainings.register');
        Route::delete('/{training}/register', [TrainingController::class, 'cancelRegistration'])->name('trainings.register.cancel');

        // Optional: list training via /trainings
        Route::get('/', [TrainingController::class, 'index'])->name('trainings.index');
    });

    // ===== HR Announcements =====
    Route::get('announcements', [AnnouncementController::class, 'index'])->name('announcements.index');

    Route::middleware('hr.or.admin')->group(function () {
        Route::post('announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
        Route::put('announcements/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
        Route::delete('announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
    });

    // ===== Notifications =====
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::put('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::put('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.readAll');

    // ===== Laporan =====
    Route::get('laporan', function () {
        return Inertia::render('laporan');
    })->name('laporan');
});

require __DIR__ . '/settings.php';
