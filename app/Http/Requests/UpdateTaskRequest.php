<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only Admin (role_id = 1) or HR (role_id = 2) can update tasks
        return $this->user() && in_array($this->user()->role_id, [1, 2]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'assigned_to' => ['required', 'exists:users,id'],
            'priority' => ['required', 'in:low,medium,high'],
            'deadline' => ['required', 'date', 'after_or_equal:today'],
            'status' => ['required', 'in:belum,proses,selesai'],
            'attachment' => ['nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:5120'], // 5MB max
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Task title is required.',
            'description.required' => 'Task description is required.',
            'assigned_to.required' => 'Please select a user to assign this task.',
            'assigned_to.exists' => 'Selected user does not exist.',
            'priority.required' => 'Task priority is required.',
            'priority.in' => 'Task priority must be low, medium, or high.',
            'deadline.required' => 'Task deadline is required.',
            'deadline.after_or_equal' => 'Deadline must be today or a future date.',
            'status.required' => 'Task status is required.',
            'status.in' => 'Task status must be belum, proses, or selesai.',
            'attachment.mimes' => 'Attachment must be a PDF, DOC, DOCX, JPG, JPEG, or PNG file.',
            'attachment.max' => 'Attachment size must not exceed 5MB.',
        ];
    }
}
