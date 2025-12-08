<?php

namespace App\Policies;

use App\Models\Laporan;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class LaporanPolicy
{
    public function view(User $user, Laporan $laporan): bool
    {
        return $user->id === $laporan->user_id || $user->role_id === 1 || $user->role_id === 2;
    }

    public function update(User $user, Laporan $laporan): bool
    {
        return $user->id === $laporan->user_id && $laporan->status !== 'accepted';
    }

    public function delete(User $user, Laporan $laporan): bool
    {
        return $user->id === $laporan->user_id && $laporan->status !== 'accepted';
    }

    public function accept(User $user, Laporan $laporan): bool
    {
        return ($user->role_id == 1 || $user->role_id == 2) && $laporan->status === 'pending';
    }

    public function decline(User $user, Laporan $laporan): bool
    {
        return ($user->role_id == 1 || $user->role_id == 2) && $laporan->status === 'pending';
    }
}
