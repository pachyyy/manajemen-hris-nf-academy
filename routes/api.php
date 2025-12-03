<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\RoleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {

    // HR atau Admin
    Route::apiResource('employees', EmployeeController::class)->middleware('admin');
    Route::post('employees/{id}/create-account', [EmployeeController::class, 'createAccount'])->middleware('admin');
    Route::post('employees/account/{id}/reset-password', [EmployeeController::class, 'resetPassword'])->middleware('admin');
    Route::delete('employees/account/{id}', [EmployeeController::class, 'deleteAccount'])->middleware('admin');
    Route::put('employees/account/{id}/role', [EmployeeController::class, 'updateRole'])->middleware('admin');
    Route::post('employees/{id}/documents', [EmployeeController::class, 'uploadDocument'])->middleware('admin');
    Route::get('employees/{id}/documents', [EmployeeController::class, 'getDocuments'])->middleware('admin');
    Route::delete('documents/{id}', [EmployeeController::class, 'deleteDocument'])->middleware('admin');
    Route::post('employees/{id}/bank-account', [EmployeeController::class, 'updateBankAccount'])->middleware('admin');
    Route::apiResource('roles', RoleController::class)->middleware('admin');
    Route::delete('attendance/{id}', [AttendanceController::class, 'destroy'])->middleware('admin');
    Route::get('attendance/summary', [AttendanceController::class, 'summary'])->middleware('admin');
    Route::get('attendance/filter', [AttendanceController::class, 'filter'])->middleware('admin');
    Route::get('employees/account/{id}/first-password', [EmployeeController::class, 'getFirstPassword'])->middleware('admin');

    // View attendance
    Route::get('attendance', [AttendanceController::class, 'index']);

    // Staff actions
    Route::post('attendance/check-in', [AttendanceController::class, 'CheckIn']);
    Route::post('attendance/check-out', [AttendanceController::class, 'CheckOut']);
    Route::post('attendance/request-leave', [AttendanceController::class, 'requestLeave']);

    // Task Management API
    Route::get('tasks', [\App\Http\Controllers\TaskController::class, 'getTasksData']);

     // Evaluation Period Management API (Admin/HR only)
    Route::prefix('evaluation-periods')->middleware('hr.or.admin')->group(function () {
        Route::post('/', [\App\Http\Controllers\EvaluationPeriodController::class, 'storeWithCriteria']);
        Route::put('/{period}', [\App\Http\Controllers\EvaluationPeriodController::class, 'update']);
        Route::delete('/{period}', [\App\Http\Controllers\EvaluationPeriodController::class, 'destroy']);
        Route::post('/{period}/open', [\App\Http\Controllers\EvaluationPeriodController::class, 'open']);
        Route::post('/{period}/close', [\App\Http\Controllers\EvaluationPeriodController::class, 'close']);

        // Criteria Management API
        Route::post('/{period}/criteria', [\App\Http\Controllers\EvaluationCriteriaController::class, 'store']);
        Route::put('/{period}/criteria/{criteria}', [\App\Http\Controllers\EvaluationCriteriaController::class, 'update']);
        Route::delete('/{period}/criteria/{criteria}', [\App\Http\Controllers\EvaluationCriteriaController::class, 'destroy']);
    });

    // Evaluation Management API
    Route::prefix('evaluations')->group(function () {
        // Admin/HR actions
        Route::middleware('hr.or.admin')->group(function () {
            Route::post('/{evaluation}/approve', [\App\Http\Controllers\EvaluationController::class, 'approveEvaluation']);
            Route::post('/{evaluation}/request-revision', [\App\Http\Controllers\EvaluationController::class, 'requestRevision']);
        });

        // Employee actions
        Route::post('/{evaluation}/submit', [\App\Http\Controllers\EvaluationController::class, 'submitSelfAssessment']);
    });

    Route::get('/staff/attendance', function (Request $request) {
        $user = $request->user();
        $employee = \App\Models\Employee::where('user_id', $user->id)->firstOrFail();
        return response()->json(
            ['records' => $employee->attendances()->orderBy('date', 'desc')->get(),
            'user' => $user,
        ]);
    })->name('staff.attendance');
    // Task Management API
    Route::get('tasks', [\App\Http\Controllers\TaskController::class, 'getTasksData']);

});
