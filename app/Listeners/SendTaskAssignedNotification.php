<?php

namespace App\Listeners;

use App\Events\TaskAssigned;
use App\Models\Message;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendTaskAssignedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     *
     * @param  \App\Events\TaskAssigned  $event
     * @return void
     */
    public function handle(TaskAssigned $event): void
    {
        $task = $event->task;

        Message::create([
            'user_id' => $task->assigned_to,
            'title' => 'Tugas Baru: ' . $task->title,
            'body' => 'Anda telah diberi tugas baru. Mohon segera periksa daftar tugas Anda untuk melihat detailnya.',
            'type' => 'task',
            'related_id' => $task->id,
        ]);
    }
}
