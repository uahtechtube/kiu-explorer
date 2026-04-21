<?php

namespace App\Traits;

use App\Models\AuditLog;

trait Auditable
{
    /**
     * Boot the auditable trait
     */
    protected static function bootAuditable()
    {
        static::created(function ($model) {
            $model->logAudit('created');
        });

        static::updated(function ($model) {
            if ($model->isDirty()) {
                $model->logAudit('updated');
            }
        });

        static::deleted(function ($model) {
            $model->logAudit('deleted');
        });
    }

    /**
     * Log an audit entry
     */
    protected function logAudit($action, array $metadata = [])
    {
        // Skip if no authenticated user (e.g., seeding)
        if (!auth()->check()) {
            return;
        }

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'model_type' => get_class($this),
            'model_id' => $this->id,
            'old_values' => $action === 'updated' ? $this->getOriginal() : null,
            'new_values' => $this->getAttributes(),
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'user_agent' => request()->userAgent(),
            'metadata' => $metadata
        ]);
    }

    /**
     * Manually log a custom action
     */
    public function audit($action, array $metadata = [])
    {
        $this->logAudit($action, $metadata);
    }
}
