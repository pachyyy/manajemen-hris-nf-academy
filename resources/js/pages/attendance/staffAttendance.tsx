import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useMemo } from 'react';

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



export default function StaffAttendance({ records, user }: StaffAttendanceProps) {

    const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Absensi',
        href: '/dashboard/attendance'
    },
    ];

    const today = new Date().toISOString().split("T")[0];

    const todayRecord = useMemo(
        () => records.find((r) => r.date === today),
        [records, today]
    );

    const handleCheckIn = async () => {
        await router.post("/attendance/check-in");
    };

    const handleCheckOut = async () => {
        await router.post("/attendance/checkout");
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Absensi Harian" />

            <div>
                <h1 className="text-2xl font-bold mb-4">Absensi Harian</h1>
            <p className="text-gray-600 mb-6">
                Hai, <strong>{user.name}</strong>. Silakan lakukan absen hari ini.
            </p>

            {/* CHECK IN / CHECK OUT BUTTONS */}
            <div className="flex gap-3 mb-8">
                {!todayRecord?.check_in && (
                    <Button onClick={handleCheckIn} className="bg-green-600">
                        Check In
                    </Button>
                )}

                {todayRecord?.check_in && !todayRecord?.check_out && (
                    <Button onClick={handleCheckOut} className="bg-blue-600">
                        Check Out
                    </Button>
                )}
            </div>

            <h2 className="text-xl font-semibold mb-3">Riwayat Absensi</h2>

            <table className="w-full border">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border">Tanggal</th>
                        <th className="p-2 border">Check In</th>
                        <th className="p-2 border">Check Out</th>
                        <th className="p-2 border">Status</th>
                        <th className="p-2 border">Bukti</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((r) => (
                        <tr key={r.id}>
                            <td className="p-2 border">{r.date}</td>
                            <td className="p-2 border">{r.check_in || "-"}</td>
                            <td className="p-2 border">{r.check_out || "-"}</td>
                            <td className="p-2 border capitalize">{r.status}</td>
                            <td className="p-2 border">
                                {r.proof_file ? (
                                    <a
                                        href={`/storage/${r.proof_file}`}
                                        target="_blank"
                                        className="text-blue-600 underline"
                                    >
                                        Lihat Bukti
                                    </a>
                                ) : (
                                    "-"
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
