<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if ($request->user() && $request->user()->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
            return $next($request);
        });
    }

    /**
     * Get all roles
     */
    public function index()
    {
        $roles = Role::withCount(['permissions', 'users'])->get();

        return response()->json(['roles' => $roles]);
    }

    /**
     * Get a specific role with permissions
     */
    public function show($id)
    {
        $role = Role::with('permissions')->findOrFail($id);

        return response()->json(['role' => $role]);
    }

    /**
     * Create a new role
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:roles,slug',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id'
        ]);

        $role = Role::create([
            'name' => $request->name,
            'slug' => $request->slug,
            'description' => $request->description
        ]);

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }

        return response()->json([
            'message' => 'Role created successfully',
            'role' => $role->load('permissions')
        ], 201);
    }

    /**
     * Update a role
     */
    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|unique:roles,slug,' . $id,
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id'
        ]);

        $role->update($request->only(['name', 'slug', 'description']));

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }

        return response()->json([
            'message' => 'Role updated successfully',
            'role' => $role->fresh('permissions')
        ]);
    }

    /**
     * Delete a role
     */
    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        
        // Prevent deleting if users are assigned
        if ($role->users()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete role with assigned users'
            ], 400);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted successfully']);
    }

    /**
     * Assign role to user
     */
    public function assignToUser(Request $request, $roleId)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $role = Role::findOrFail($roleId);
        $user = User::findOrFail($request->user_id);

        $user->assignRole($role);

        return response()->json([
            'message' => 'Role assigned successfully',
            'user' => $user->fresh('roles')
        ]);
    }

    /**
     * Remove role from user
     */
    public function removeFromUser(Request $request, $roleId)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $role = Role::findOrFail($roleId);
        $user = User::findOrFail($request->user_id);

        $user->removeRole($role);

        return response()->json([
            'message' => 'Role removed successfully',
            'user' => $user->fresh('roles')
        ]);
    }

    /**
     * Get all permissions
     */
    public function permissions()
    {
        $permissions = Permission::all()->groupBy('category');

        return response()->json(['permissions' => $permissions]);
    }

    /**
     * Get users with a specific role
     */
    public function users($roleId)
    {
        $role = Role::findOrFail($roleId);
        $users = $role->users()->select('id', 'surname', 'first_name', 'email', 'role')->get();

        return response()->json([
            'role' => $role,
            'users' => $users
        ]);
    }
}
