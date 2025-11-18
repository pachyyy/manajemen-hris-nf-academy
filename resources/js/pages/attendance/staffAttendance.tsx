import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface AttendanceRecord {
    id: number;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: string;
    proof_file: string | null;
}

interface StaffAttendanceProps {
    records: AttendanceRecord[];
    user: { id: number; name: string };
}

export default function StaffAttendance({
    records,
    user,
}: StaffAttendanceProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Absensi',
            href: '/dashboard/attendance',
        },
    ];

    const today = new Date().toISOString().split('T')[0];

    const todayRecord = useMemo(
        () => records.find((r) => r.date === today),
        [records, today],
    );

    const handleCheckIn = async () => {
        await router.post('/attendance/check-in');
    };

    const handleCheckOut = async () => {
        await router.post('/attendance/check-out');
    };

    // State untuk izin atau sakit
    const [leaveStatus, setLeaveStatus] = useState('izin');
    const [proofFile, setProofFile] = useState<File | null>(null);

    const handleRequestLeave = async () => {
        if (!leaveStatus) return;

        const formData = new FormData();
        formData.append('status', leaveStatus);
        if (proofFile) formData.append('proof_file', proofFile);

        await router.post('/api/attendance/request-leave', formData, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Absensi Harian" />

            <div>
                <h1 className="mb-4 text-2xl font-bold">Absensi Harian</h1>
                <p className="mb-6 text-gray-600">
                    Hai, <strong>{user.name}</strong>. Silakan lakukan absen
                    hari ini.
                </p>

                {/* CHECK IN / CHECK OUT BUTTONS */}
                <div className="mb-8 flex gap-3">
                    {!todayRecord?.check_in && (
                        <Button
                            onClick={handleCheckIn}
                            className="bg-green-600"
                        >
                            Check In
                        </Button>
                    )}

                    {todayRecord?.check_in && !todayRecord?.check_out && (
                        <Button
                            onClick={handleCheckOut}
                            className="bg-blue-600"
                        >
                            Check Out
                        </Button>
                    )}
                </div>

                {/* Ajukan izin atau sakit atau cuti */}
                {!todayRecord && (
                    <div className="mb-8 rounded border bg-white p-4 shadow dark:bg-neutral-800">
                        <h2 className="mb-3 text-lg font-semibold">
                            Ajukan Izin / Sakit / Cuti
                        </h2>

                        <div className="mb-3">
                            <label className="mb-1 block font-medium">
                                Jenis Pengajuan
                            </label>
                            <select
                                value={leaveStatus}
                                onChange={(e) => setLeaveStatus(e.target.value)}
                                className="w-full rounded border p-2 dark:bg-neutral-700"
                            >
                                <option value="izin">Izin</option>
                                <option value="sakit">Sakit</option>
                                <option value="cuti">Cuti</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="mb-1 block font-medium">
                                Upload Bukti (opsional)
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) =>
                                    setProofFile(e.target.files?.[0] || null)
                                }
                                className="w-full rounded border p-2 dark:bg-neutral-700"
                            />
                        </div>

                        <Button
                            onClick={handleRequestLeave}
                            className="bg-yellow-600"
                        >
                            Ajukan Izin
                        </Button>
                    </div>
                )}

                <h2 className="mb-3 text-xl font-semibold">Riwayat Absensi</h2>

                <table className="w-full border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Tanggal</th>
                            <th className="border p-2">Check In</th>
                            <th className="border p-2">Check Out</th>
                            <th className="border p-2">Status</th>
                            <th className="border p-2">Bukti</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((r) => (
                            <tr key={r.id}>
                                <td className="border p-2">{r.date}</td>
                                <td className="border p-2">
                                    {r.check_in || '-'}
                                </td>
                                <td className="border p-2">
                                    {r.check_out || '-'}
                                </td>
                                <td className="border p-2 capitalize">
                                    {r.status}
                                </td>
                                <td className="border p-2">
                                    {r.proof_file ? (
                                        <a
                                            href={`/storage/${r.proof_file}`}
                                            target="_blank"
                                            className="text-blue-600 underline"
                                        >
                                            Lihat Bukti
                                        </a>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
