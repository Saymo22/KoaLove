<?php

namespace App\Policies;

use App\Models\Purchase;
use App\Models\User;

class PurchasePolicy
{
    public function view(User $user, Purchase $purchase): bool
    {
        return $purchase->user_id === $user->id || $user->role === 'admin';
    }

    public function update(User $user, Purchase $purchase): bool
    {
        return $purchase->user_id === $user->id && ! $purchase->trashed();
    }
}
