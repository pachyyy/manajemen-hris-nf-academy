import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
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

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Rekap absensi', href: '/dashboard/attendance/summary' },
    ];

    const fetchSummary = async () => {
        const res = await fetch("/api/attendance/summary");
        const d = await res.json();
        setData(d);
    };

    useEffect(() => {
        (async () => {
            await fetchSummary();
        })();
    }, []);

    if (!data) return <p>Loading...</p>;

    const s = data.summary;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div>
                <h1 className="text-2xl font-bold mb-4">Attendance Summary</h1>

                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded bg-white shadow">
                        <h2 className="font-semibold">Total Pegawai</h2>
                        <p className="text-2xl">{data.totalEmployees}</p>
                    </div>

                    <div className="p-4 rounded bg-white shadow">
                        <h2 className="font-semibold">Sudah Absen</h2>
                        <p className="text-2xl">{data.alreadyAbsented}</p>
                    </div>

                    <div className="p-4 rounded bg-white shadow">
                        <h2 className="font-semibold">Belum Absen</h2>
                        <p className="text-2xl">{data.notYetAbsented}</p>
                    </div>
                </div>

                <h2 className="text-xl font-semibold mt-6 mb-2">Status Hari ini</h2>

                <table className="w-full border">
                    <tbody>
                        <tr className="p-2 border"><td>Hadir</td><td className="p-2 border">{s.hadir}</td></tr>
                        <tr className="p-2 border"><td>Izin</td><td className="p-2 border">{s.izin}</td></tr>
                        <tr className="p-2 border"><td>Sakit</td><td className="p-2 border">{s.sakit}</td></tr>
                        <tr className="p-2 border"><td>Cuti</td><td className="p-2 border">{s.cuti}</td></tr>
                        <tr className="p-2 border"><td>Alpha</td><td className="p-2 border">{s.alpha}</td></tr>
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
