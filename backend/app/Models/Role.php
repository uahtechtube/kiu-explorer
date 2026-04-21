<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description'
    ];

    /**
     * Get the permissions for this role
     */
    public function permissions()
    {
        return $this->belongsToMany(Permission::class);
    }

    /**
     * Get the users with this role
     */
    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    /**
     * Check if role has a specific permission
     */
    public function hasPermission($permission)
    {
        if (is_string($permission)) {
            return $this->permissions()->where('slug', $permission)->exists();
        }

        return $this->permissions()->where('id', $permission->id)->exists();
    }

    /**
     * Grant a permission to this role
     */
    public function grantPermission($permission)
    {
        if (is_string($permission)) {
            $permission = Permission::where('slug', $permission)->firstOrFail();
        }

        $this->permissions()->syncWithoutDetaching($permission);
    }

    /**
     * Revoke a permission from this role
     */
    public function revokePermission($permission)
    {
        if (is_string($permission)) {
            $permission = Permission::where('slug', $permission)->firstOrFail();
        }

        $this->permissions()->detach($permission);
    }

    /**
     * Sync permissions for this role
     */
    public function syncPermissions(array $permissions)
    {
        $this->permissions()->sync($permissions);
    }
}
