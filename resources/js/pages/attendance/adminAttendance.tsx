import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { useEffect, useState } from 'react';

interface AttendaceRecord {
    id: number;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: string;
    employee: {
        first_name: string;
        last_name: string;
        division: string;
    };
}

export default function AdminAttendance() {
    const [records, setRecords] = useState<AttendaceRecord[]>([]);
    const [date, setDate] = useState("");
    const [division, setDivision] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Absensi', href: '/dashboard/attendance/admin' },
    ];

    // Fetch All Records
    const fetchRecords = async () => {
        try {
            const res = await fetch('/api/attendance', {
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content ?? '',
                },
            });
            if (!res.ok) throw new Error('Failed to fetch attendance data');

            const data = await res.json();
            setRecords(data);
        } catch (err) {
            setError('Failed to load attendance.');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    // Handle Delete
    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const res = await fetch(`/api/attendance/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content ?? '',
                },
            });
            if (!res.ok) throw new Error('Failed to delete attendance record');

            fetchRecords();
            setIsDeleteModalOpen(false);
        } catch (err) {
            setError('Failed to delete record.');
            console.error(err);
        }
    };

    const openDeleteModal = (id: number) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const applyFilter = async () => {
        try {
            const params = new URLSearchParams();

            if (date) params.append("date", date);
            if (division) params.append("division", division);

            const res = await fetch(`/api/attendance/filter?${params.toString()}`, {
                headers: { Accept: "application/json" }
            });

            const data = await res.json();
            setRecords(data);
        } catch (err) {
            console.log(err);
            setError("Failed to apply filter");
        }
    };

    // UI
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div>
                <h1 className="mb-4 text-2xl font-bold">Attendance Records</h1>

                <div className="flex gap-4 mb-4">
                    <div>
                        <label className="text-sm font-semibold">Filter by Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="border p-2 rounded w-full"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold">Filter by Division</label>
                        <select
                            value={division}
                            onChange={(e) => setDivision(e.target.value)}
                            className="border p-2 rounded w-full"
                        >
                            <option value="">All</option>
                            <option value="admin">Admin</option>
                            <option value="marketing">Marketing</option>
                            <option value="operasional">Operasional</option>
                            <option value="riset dan pengembangan">Riset dan Pengembangan</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <Button
                            onClick={applyFilter}
                            className="bg-blue-600 text-white"
                        >
                            Apply Filter
                        </Button>
                    </div>
                </div>

                {error && <p className="mb-3 text-red-500">{error}</p>}

                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onCancel={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                />

                <table className="mt-4 w-full border">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-neutral-700">
                            <th className="border p-2">Employee</th>
                            <th className="border p-2">Division</th>
                            <th className="border p-2">Date</th>
                            <th className="border p-2">Check In</th>
                            <th className="border p-2">Check Out</th>
                            <th className="border p-2">Status</th>
                            <th className="border p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length === 0 ? (
                            <tr>
                                <td className="p-4 text-center" colSpan={7}>
                                    No attendance records found.
                                </td>
                            </tr>
                        ) : (
                            records.map((rec) => (
                                <tr key={rec.id} className="border-b">
                                    <td className="border p-2">
                                        {rec.employee.first_name}{' '}
                                        {rec.employee.last_name}
                                    </td>
                                    <td className="border p-2">
                                        {rec.employee.division}
                                    </td>
                                    <td className="border p-2">{rec.date}</td>
                                    <td className="border p-2">
                                        {rec.check_in ?? '-'}
                                    </td>
                                    <td className="border p-2">
                                        {rec.check_out ?? '-'}
                                    </td>
                                    <td className="border p-2 capitalize">
                                        {rec.status}
                                    </td>
                                    <td className="border p-2">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                openDeleteModal(rec.id)
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
