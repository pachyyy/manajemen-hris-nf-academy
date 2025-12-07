<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function getMaximumAttendanceTime()
    {
        $setting = Setting::find('max_attendance_time');
        return response()->json(['time' => $setting ? $setting->value : '09:00']);
    }

    public function updateMaximumAttendanceTime(Request $request)
    {
        $request->validate(['time' => 'required|date_format:H:i']);

        Setting::updateOrCreate(
            ['key' => 'max_attendance_time'],
            ['value' => $request->time]
        );

        return response()->json(['message' => 'Maximum attendance time updated successfully.']);
    }
}