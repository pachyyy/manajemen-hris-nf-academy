<?php

use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\RoleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('employees', EmployeeController::class)->middleware('admin');
    Route::post('employees/{id}/create-account', [EmployeeController::class, 'createAccount'])->middleware('admin');
    Route::post('employees/account/{id}/reset-password', [EmployeeController::class, 'resetPassword'])->middleware('admin');
    Route::delete('employees/account/{id}', [EmployeeController::class, 'deleteAccount'])->middleware('admin');
    Route::put('employees/account/{id}/role', [EmployeeController::class, 'updateRole'])->middleware('admin');
    Route::post('employees/{id}/documents', [EmployeeController::class, 'uploadDocument'])->middleware('admin');
    Route::get('employees/{id}/documents', [EmployeeController::class, 'getDocuments'])->middleware('admin');
    Route::delete('documents/{id}', [EmployeeController::class, 'deleteDocument'])->middleware('admin');
    Route::apiResource('roles', RoleController::class)->middleware('admin');
});
