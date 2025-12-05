<?php

namespace App\Listeners;

use App\Events\TrainingCreated;
use App\Models\Message;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendTrainingCreatedNotification implements ShouldQueue
{
    use InteractsWithQueue;
    /**
     * Handle the event.
     *
     * @param  \App\Events\TrainingCreated  $event
     * @return void
     */
    public function handle(TrainingCreated $event): void
    {
        $training = $event->training;
        // Assuming role_id 3 is for staff. Adjust if necessary.
        $staffUsers = User::where('role_id', 3)->get();

        foreach ($staffUsers as $user) {
            Message::create([
                'user_id' => $user->id,
                'title' => 'Pelatihan Baru Tersedia: ' . $training->title,
                'body' => 'Sebuah pelatihan baru telah ditambahkan. Silakan periksa halaman pelatihan untuk melihat detail lebih lanjut dan melakukan pendaftaran.',
                'type' => 'training',
                'related_id' => $training->id,
            ]);
        }
    }
}
