<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Employee::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'division' => 'required|string',
            'position' => 'required|string',
            'join_date' => 'required|date',
            'contact' => 'required|string',
            'status' => 'required|in:aktif,cuti,resign',
            'user_id' => 'required|exists:users,id',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('document')) {
            $validated['document_path'] = $request->file('document')->store('documents', 'public');
        }

        $employee = Employee::create($validated);
        return response()->json($employee, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Employee $employee)
    {
        return response()->json($employee);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'division' => 'string',
            'position' => 'string',
            'join_date' => 'date',
            'contact' => 'string',
            'status' => 'in:aktif,cuti,resign',
            'user_id' => 'exists:users,id',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('document')) {
            $validated['document_path'] = $request->file('document')->store('document', 'public');
        }

        $employee->update($validated);
        return response()->json($employee);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee)
    {
        $employee->delete();
        return response()->json(null, 204);
    }
}
