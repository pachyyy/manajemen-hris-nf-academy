<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Role;
use App\Models\EmployeeDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

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
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'email' => 'required|string',
            'phone' => 'required|string',
            'birth_date' => 'required|date',
            'division' => 'required|string',
            'position' => 'required|string',
            'join_date' => 'required|date',
            'status' => 'required|in:aktif,cuti,resign',
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
            'first_name' => 'sometimes|string',
            'last_name' => 'sometimes|string',
            'email' => 'sometimes|string',
            'phone' => 'sometimes|string',
            'birth_date' => 'sometimes|date',
            'division' => 'sometimes|string',
            'position' => 'sometimes|string',
            'join_date' => 'date',
            'status' => 'in:aktif,cuti,resign',
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

    public function showAccount($id)
    {
        $employee = Employee::with('user')->findOrFail($id);
        $roles = Role::all();
        return Inertia::render('admin/employeeAccount', [
            'employee' => $employee,
            'roles' => $roles,
        ]);
    }

    public function createAccount(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);

        if ($employee->user) {
            return response()->json(['message' => 'Account already exists.'], 409);
        }

        $password = Str::random(8);
        $user = User::create([
            'name' => $employee->first_name . ' ' . $employee->last_name,
            'email' => $employee->email,
            'password' => Hash::make($password),
            'role_id' => 2, // Assuming 2 is the role for employees
            'first_password' => $password,
        ]);

        $employee->user_id = $user->id;
        $employee->save();

        return response()->json([
            'user' => $user,
            'password' => $password
        ]);
    }

    public function deleteAccount($id)
    {
        $user = User::findOrFail($id);
        $employee = Employee::where('user_id', $user->id)->first();

        if ($employee) {
            $employee->user_id = null;
            $employee->save();
        }

        $user->delete();

        return response()->json(null, 204);
    }

    public function getFirstPassword($id) {
        $user = User::find($id);

        return response()->json([
            'message' => 'Success',
            'first_password' => $user->first_password,
        ]);
    }

    public function resetPassword(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $newPassword = Str::random(8);
        $user->password = Hash::make($newPassword);
        $user->first_password = $newPassword;
        $user->save();

        return response()->json([
            'message' => 'Password reset successfully',
            'password' => $newPassword
        ]);
    }

    public function updateRole(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $user->role_id = $validated['role_id'];
        $user->save();

        return response()->json($user);
    }

    public function uploadDocument(Request $request, $id)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'name' => 'required|string',
        ]);

        $path = $request->file('document')->store('employee-documents', 'public');

        EmployeeDocument::create([
            'employee_id' => $id,
            'name' => $request->name,
            'file_path' => $path,
        ]);

        return response()->json(['message' => 'Document uploaded successfully',]);
    }

    public function getDocuments($id) {
        return EmployeeDocument::where('employee_id', $id)->get();
    }

    public function deleteDocument($id) {
        $doc = EmployeeDocument::findOrFail($id);

        Storage::disk('public')->delete($doc->file_path);

        $doc->delete();
        return response()->json(['message' => 'Document deleted']);
    }

    public function updateBankAccount(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);

        $validated = $request->validate([
            'bank_account_number' => 'required|string',
        ]);

        $updateData = [
            'bank_name' => 'BCA', // Hardcode the bank name
            'bank_account_number' => $validated['bank_account_number'],
        ];

        $employee->update($updateData);

        return response()->json($employee);
    }
}
