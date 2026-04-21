<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // User Management
            ['name' => 'View Users', 'slug' => 'users.view', 'category' => 'users', 'description' => 'View user list and details'],
            ['name' => 'Create Users', 'slug' => 'users.create', 'category' => 'users', 'description' => 'Create new users'],
            ['name' => 'Edit Users', 'slug' => 'users.edit', 'category' => 'users', 'description' => 'Edit user information'],
            ['name' => 'Delete Users', 'slug' => 'users.delete', 'category' => 'users', 'description' => 'Delete users'],
            ['name' => 'Manage User Status', 'slug' => 'users.status', 'category' => 'users', 'description' => 'Block/unblock users'],

            // Content Moderation
            ['name' => 'View Content', 'slug' => 'content.view', 'category' => 'content', 'description' => 'View pending content'],
            ['name' => 'Approve Content', 'slug' => 'content.approve', 'category' => 'content', 'description' => 'Approve pending content'],
            ['name' => 'Reject Content', 'slug' => 'content.reject', 'category' => 'content', 'description' => 'Reject pending content'],
            ['name' => 'Delete Content', 'slug' => 'content.delete', 'category' => 'content', 'description' => 'Delete flagged content'],
            ['name' => 'View Reports', 'slug' => 'reports.view', 'category' => 'content', 'description' => 'View content reports'],
            ['name' => 'Resolve Reports', 'slug' => 'reports.resolve', 'category' => 'content', 'description' => 'Resolve content reports'],

            // Course Management
            ['name' => 'View Courses', 'slug' => 'courses.view', 'category' => 'courses', 'description' => 'View course list'],
            ['name' => 'Create Courses', 'slug' => 'courses.create', 'category' => 'courses', 'description' => 'Create new courses'],
            ['name' => 'Edit Courses', 'slug' => 'courses.edit', 'category' => 'courses', 'description' => 'Edit course information'],
            ['name' => 'Delete Courses', 'slug' => 'courses.delete', 'category' => 'courses', 'description' => 'Delete courses'],
            ['name' => 'Manage Registrations', 'slug' => 'courses.registrations', 'category' => 'courses', 'description' => 'Approve course registrations'],

            // Analytics
            ['name' => 'View Analytics', 'slug' => 'analytics.view', 'category' => 'analytics', 'description' => 'View system analytics'],
            ['name' => 'Export Analytics', 'slug' => 'analytics.export', 'category' => 'analytics', 'description' => 'Export analytics data'],

            // System Management
            ['name' => 'View System Health', 'slug' => 'system.view', 'category' => 'system', 'description' => 'View system health metrics'],
            ['name' => 'Manage System', 'slug' => 'system.manage', 'category' => 'system', 'description' => 'Manage system settings'],
            ['name' => 'View Alerts', 'slug' => 'alerts.view', 'category' => 'system', 'description' => 'View system alerts'],
            ['name' => 'Manage Alerts', 'slug' => 'alerts.manage', 'category' => 'system', 'description' => 'Create and resolve alerts'],

            // Audit Logs
            ['name' => 'View Audit Logs', 'slug' => 'audit.view', 'category' => 'audit', 'description' => 'View audit logs'],
            ['name' => 'Export Audit Logs', 'slug' => 'audit.export', 'category' => 'audit', 'description' => 'Export audit logs'],

            // Roles & Permissions
            ['name' => 'View Roles', 'slug' => 'roles.view', 'category' => 'roles', 'description' => 'View roles and permissions'],
            ['name' => 'Manage Roles', 'slug' => 'roles.manage', 'category' => 'roles', 'description' => 'Create and edit roles'],
            ['name' => 'Assign Roles', 'slug' => 'roles.assign', 'category' => 'roles', 'description' => 'Assign roles to users'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }

        // Create roles
        $superAdmin = Role::create([
            'name' => 'Super Admin',
            'slug' => 'super-admin',
            'description' => 'Full system access with all permissions'
        ]);

        $contentModerator = Role::create([
            'name' => 'Content Moderator',
            'slug' => 'content-moderator',
            'description' => 'Manage and moderate content submissions'
        ]);

        $userManager = Role::create([
            'name' => 'User Manager',
            'slug' => 'user-manager',
            'description' => 'Manage user accounts and registrations'
        ]);

        $analyticsViewer = Role::create([
            'name' => 'Analytics Viewer',
            'slug' => 'analytics-viewer',
            'description' => 'Read-only access to analytics and reports'
        ]);

        // Assign permissions to Super Admin (all permissions)
        $superAdmin->permissions()->attach(Permission::all());

        // Assign permissions to Content Moderator
        $contentModerator->permissions()->attach(
            Permission::whereIn('slug', [
                'content.view',
                'content.approve',
                'content.reject',
                'content.delete',
                'reports.view',
                'reports.resolve',
                'audit.view'
            ])->pluck('id')
        );

        // Assign permissions to User Manager
        $userManager->permissions()->attach(
            Permission::whereIn('slug', [
                'users.view',
                'users.create',
                'users.edit',
                'users.status',
                'courses.registrations',
                'audit.view'
            ])->pluck('id')
        );

        // Assign permissions to Analytics Viewer
        $analyticsViewer->permissions()->attach(
            Permission::whereIn('slug', [
                'analytics.view',
                'analytics.export',
                'system.view',
                'audit.view'
            ])->pluck('id')
        );

        $this->command->info('Permissions and roles seeded successfully!');
    }
}
