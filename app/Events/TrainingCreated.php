<?php

namespace App\Events;

use App\Models\Training;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TrainingCreated
{
    use Dispatchable, SerializesModels;

    public $training;

    /**
     * Create a new event instance.
     *
     * @param  \App\Models\Training  $training
     * @return void
     */
    public function __construct(Training $training)
    {
        $this->training = $training;
    }
}
