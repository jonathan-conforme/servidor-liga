<?php

namespace App\Traits;

use App\Scopes\TenantScope;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant()
    {
        static::addGlobalScope(
            new TenantScope()
        );

        static::creating(function ($model) {

            if (
                auth()->check() &&
                ! auth()->user()->hasRole('Super Admin') &&
                empty($model->tenant_id) 
            ) {
                $model->tenant_id =
                    auth()->user()->tenant_id;
            }
        });
    }
}

