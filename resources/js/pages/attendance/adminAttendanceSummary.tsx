import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";

interface AttendanceSummary {
    hadir: number;
    izin: number;
    sakit: number;
    cuti: number;
    alpha: number;
}

interface SummaryResponse {
    today: string;
    summary: AttendanceSummary;
    totalEmployees: number;
    alreadyAbsented: number;
    notYetAbsented: number;
}

export default function AdminAttendanceSummary() {
    const [data, setData] = useState<SummaryResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Attendance', href: '/dashboard/admin/attendance' },
        { title: 'Attendance Summary', href: '/dashboard/admin/attendance/summary' },
    ];

    const fetchData = async () => {
        try {
            const response = await fetch('/api/attendance/summary');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const d = await response.json();
            setData(d);
        } catch (error) {
            console.error('Failed to fetch!', error);
            setError('Failed to fetch attendance summary.');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    if (error) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Ringkasan Kehadiran" />
                <p>{error}</p>
            </AppLayout>
        );
    }

    const s = data?.summary;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ringkasan Kehadiran" />
            <div className="p-2">
                <h1 className="text-2xl font-bold mb-4">Ringkasan Kehadiran</h1>

                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded bg-white shadow">
                        <h2 className="font-semibold">Total Pegawai</h2>
                        <p className="text-2xl">{data?.totalEmployees ?? 0}</p>
                    </div>

                    <div className="p-4 rounded bg-white shadow">
                        <h2 className="font-semibold">Sudah Absen</h2>
                        <p className="text-2xl">{data?.alreadyAbsented ?? 0}</p>
                    </div>

                    <div className="p-4 rounded bg-white shadow">
                        <h2 className="font-semibold">Belum Absen</h2>
                        <p className="text-2xl">{data?.notYetAbsented ?? 0}</p>
                    </div>
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Status Hari ini</h2>

                <Table className="w-[50%] border border-gray-200">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Jumlah</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Hadir</TableCell>
                            <TableCell className="text-center">{s?.hadir ?? 0}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Izin</TableCell>
                            <TableCell className="text-center">{s?.izin ?? 0}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Sakit</TableCell>
                            <TableCell className="text-center">{s?.sakit ?? 0}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Cuti</TableCell>
                            <TableCell className="text-center">{s?.cuti ?? 0}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Alpha</TableCell>
                            <TableCell className="text-center">{s?.alpha ?? 0}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
