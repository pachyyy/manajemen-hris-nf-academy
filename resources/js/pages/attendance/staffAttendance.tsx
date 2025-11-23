import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    };
    return date.toLocaleDateString('en-GB', options); // 'en-GB' for day-month-year order
};

interface AttendanceRecord {
    id: number;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: string;
    proof_file: string | null;
}

export default function StaffAttendance() {
    const [attendanceRecords, setAttendanceRecords] = useState<
        AttendanceRecord[]
    >([]);
    const [currentUser, setCurrentUser] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Absensi',
            href: '/dashboard/attendance',
        },
    ];

    const today = new Date().toISOString().split('T')[0];

    const fetchAttendanceData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/staff/attendance', {
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAttendanceRecords(data.records);
            setCurrentUser(data.user);
        } catch (err: unknown) {
            console.error('Failed to fetch attendance data:', err);
            setError((err as Error).message || 'Failed to load attendance data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    const todayRecord = useMemo(
        () => attendanceRecords.find((r) => r.date === today),
        [attendanceRecords, today],
    );

    const handleCheckIn = async () => {
        await router.post('/api/attendance/check-in');
        fetchAttendanceData(); // Refresh data after action
    };

    const handleCheckOut = async () => {
        await router.post('/api/attendance/check-out');
        fetchAttendanceData(); // Refresh data after action
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
        fetchAttendanceData(); // Refresh data after action
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Absensi Harian" />
                <div>Loading attendance data...</div>
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Absensi Harian" />
                <div className="text-red-500">Error: {error}</div>
            </AppLayout>
        );
    }

    if (!currentUser) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Absensi Harian" />
                <div>User data not found.</div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Absensi Harian" />

            <div>
                <h1 className="mb-4 text-2xl font-bold">Absensi Harian</h1>
                <p className="mb-6 text-gray-600">
                    Hai, <strong>{currentUser.name}</strong>. Silakan lakukan
                    absen hari ini.
                </p>

                {/* CHECK IN / CHECK OUT BUTTONS */}
                <div className="mb-8 flex gap-3">
                    {!todayRecord?.check_in && (
                        <Button onClick={handleCheckIn} className="">
                            Check In
                        </Button>
                    )}

                    {todayRecord?.check_in && !todayRecord?.check_out && (
                        <Button onClick={handleCheckOut} className="">
                            Check Out
                        </Button>
                    )}
                </div>

                {/* Ajukan izin atau sakit atau cuti */}
                {!todayRecord && (
                    <div className="mb-8 rounded border p-4 shadow">
                        <h2 className="mb-3 text-lg font-semibold">
                            Ajukan Izin / Sakit / Cuti
                        </h2>

                        <div className="mb-3">
                            <Label className="mb-1 block font-medium">
                                Jenis Pengajuan
                            </Label>
                            <Select
                                value={leaveStatus}
                                onValueChange={(value) => setLeaveStatus(value)}
                            >
                                <SelectTrigger
                                    className="max-w-20"
                                    name="leave_status"
                                >
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="izin">Izin</SelectItem>
                                    <SelectItem value="sakit">Sakit</SelectItem>
                                    <SelectItem value="cuti">Cuti</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="mb-3 w-full max-w-xs">
                            <Label className="mb-1 block font-medium">
                                Upload Bukti (opsional)
                            </Label>
                            {/* <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) =>
                                    setProofFile(e.target.files?.[0] || null)
                                }
                                className="w-full rounded border p-2 dark:bg-neutral-700"
                            /> */}
                            <Input
                                id="proofFile"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) =>
                                    setProofFile(e.target.files?.[0] || null)
                                }
                            />
                        </div>

                        <Button
                            onClick={handleRequestLeave}
                            className="bg-yellow-600 hover:bg-yellow-700"
                        >
                            Ajukan Izin
                        </Button>
                    </div>
                )}

                <h2 className="mb-3 text-xl font-semibold">Riwayat Absensi</h2>

                <Table>
                    <TableCaption>
                        A list of the staff's attendance.
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Check In</TableHead>
                            <TableHead>Check Out</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Bukti</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attendanceRecords.map((r) => (
                            <TableRow key={r.id}>
                                <TableCell>{formatDate(r.date)}</TableCell>
                                <TableCell>{r.check_in || '-'}</TableCell>
                                <TableCell>{r.check_out || '-'}</TableCell>
                                <TableCell className="capitalize">
                                    {r.status}
                                </TableCell>
                                <TableCell>
                                    {r.proof_file ? (
                                        <Link
                                            href={`/storage/${r.proof_file}`}
                                            target="_blank"
                                            className="text-blue-600 underline"
                                        >
                                            Lihat Bukti
                                        </Link>
                                    ) : (
                                        '-'
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
