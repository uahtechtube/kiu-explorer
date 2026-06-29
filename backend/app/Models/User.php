<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name', // Keep mostly for backward compat or alias
        'user_id',
        'matric_number',
        'surname',
        'first_name',
        'other_names',
        'gender',
        'dob',
        'nationality',
        'state_of_origin',
        'lga',
        'passport_photograph',
        'email',
        'phone_number',
        'alternative_phone_number',
        'residential_address',
        'city',
        'state_of_residence',
        'username',
        'role',
        'account_status',
        'expo_push_token',
        'last_login_date',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['name', 'registration_number'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'dob' => 'date',
            'last_login_date' => 'datetime',
        ];
    }

    /**
     * Get the user's full name.
     *
     * @return string
     */
    public function getNameAttribute(): string
    {
        return trim(($this->first_name ?? '') . ' ' . ($this->surname ?? ''));
    }

    /**
     * Get the student's registration number (alias for matric_number).
     *
     * @return string|null
     */
    public function getRegistrationNumberAttribute()
    {
        return $this->matric_number;
    }

    /**
     * Get the user's passport photograph as an absolute URL.
     *
     * @param  string|null  $value
     * @return string
     */
    public function getPassportPhotographAttribute($value)
    {
        if (!$value) {
            return url('assets/defaults/avatar.png');
        }

        if (strpos($value, 'http') === 0) {
            return $value;
        }

        return url($value);
    }

    public function studentProfile()
    {
        return $this->hasOne(StudentProfile::class);
    }

    public function shop()
    {
        return $this->hasOne(Shop::class);
    }

    public function aiConversations()
    {
        return $this->hasMany(AiConversation::class);
    }

    public function gpaEntries()
    {
        return $this->hasMany(GpaEntry::class);
    }

    public function vaultDocuments()
    {
        return $this->hasMany(VaultDocument::class);
    }

    public function roommateProfile()
    {
        return $this->hasOne(HostelRoommateProfile::class, 'student_id');
    }

    public function lecturerProfile()
    {
        return $this->hasOne(LecturerProfile::class);
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function isLecturer(): bool
    {
        return $this->role === 'lecturer';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    // Friend Request Relationships
    public function sentFriendRequests()
    {
        return $this->hasMany(FriendRequest::class, 'sender_id');
    }

    public function receivedFriendRequests()
    {
        return $this->hasMany(FriendRequest::class, 'receiver_id');
    }

    public function friends()
    {
        return $this->belongsToMany(User::class, 'friendships', 'user_id', 'friend_id')
            ->withTimestamps();
    }

    // Group Relationships
    public function groups()
    {
        return $this->belongsToMany(Group::class, 'group_members')
            ->withPivot('role', 'status')
            ->withTimestamps();
    }

    public function createdGroups()
    {
        return $this->hasMany(Group::class, 'creator_id');
    }

    // Posts relationship for social features
    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    // Role-Based Permissions
    public function roles()
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole($role)
    {
        if (is_string($role)) {
            return $this->roles()->where('slug', $role)->exists();
        }

        return $this->roles()->where('id', $role->id)->exists();
    }

    /**
     * Check if user has any of the given roles
     */
    public function hasAnyRole(array $roles)
    {
        return $this->roles()->whereIn('slug', $roles)->exists();
    }

    /**
     * Check if user has a specific permission
     */
    public function hasPermission($permission)
    {
        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permission) {
                $query->where('slug', $permission);
            })
            ->exists();
    }

    /**
     * Check if user has any of the given permissions
     */
    public function hasAnyPermission(array $permissions)
    {
        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permissions) {
                $query->whereIn('slug', $permissions);
            })
            ->exists();
    }

    /**
     * Assign a role to the user
     */
    public function assignRole($role)
    {
        if (is_string($role)) {
            $role = Role::where('slug', $role)->firstOrFail();
        }

        $this->roles()->syncWithoutDetaching($role);
    }

    /**
     * Remove a role from the user
     */
    public function removeRole($role)
    {
        if (is_string($role)) {
            $role = Role::where('slug', $role)->firstOrFail();
        }

        $this->roles()->detach($role);
    }

    /**
     * Sync user roles
     */
    public function syncRoles(array $roles)
    {
        $this->roles()->sync($roles);
    }
}
