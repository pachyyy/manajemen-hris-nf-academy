<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    // Show all role
    public function index () {
        return Role::all();
    }

    // Show one role
    public function show(Role $role) {
        return $role;
    }

    // Add role
    public function store (Request $request){
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles',
            'description' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'The given data was invalid.', 'errors' => $validator->errors()], 422);
        }

        $role = Role::create($validator->validated());
        return response()->json($role, 201);
    }

    // Update role
    public function update(Request $request, Role $role){
        $validator = Validator::make($request->all(), [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('roles')->ignore($role->id),
            ],
            'description' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'The given data was invalid.', 'errors' => $validator->errors()], 422);
        }

        $role->update($validator->validated());
        return response()->json($role);
    }

    // Delete role
    public function destroy(Role $role){
        $role->delete();
        return response()->json(null, 204);
    }
}
