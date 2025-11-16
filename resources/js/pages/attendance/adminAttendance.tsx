import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { useEffect, useState } from "react";



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
    const [error, setError] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Attendance", href: "/dashboard/attendance/admin" },
    ];

    // Fetch All Records
    const fetchRecords = async () => {
        try {
            const res = await fetch("/api/attendance", {
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN":
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? "",
                },
            });
            if (!res.ok) throw new Error("Failed to fetch attendance data");

            const data = await res.json();
            setRecords(data);
        } catch (err) {
            setError("Failed to load attendance.");
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
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN":
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? "",
                },
            });
            if (!res.ok) throw new Error("Failed to delete attendance record");

            fetchRecords();
            setIsDeleteModalOpen(false);
        } catch (err) {
            setError("Failed to delete record.");
            console.error(err);
        }
    };

    const openDeleteModal = (id: number) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    // UI
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div>
                <h1 className="text-2xl font-bold mb-4">Attendance Records</h1>

            {error && <p className="text-red-500 mb-3">{error}</p>}

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
            />

            <table className="w-full border mt-4">
                <thead>
                    <tr className="bg-gray-100 dark:bg-neutral-700">
                        <th className="p-2 border">Employee</th>
                        <th className="p-2 border">Division</th>
                        <th className="p-2 border">Date</th>
                        <th className="p-2 border">Check In</th>
                        <th className="p-2 border">Check Out</th>
                        <th className="p-2 border">Status</th>
                        <th className="p-2 border">Action</th>
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
                                <td className="p-2 border">
                                    {rec.employee.first_name}{" "}
                                    {rec.employee.last_name}
                                </td>
                                <td className="p-2 border">
                                    {rec.employee.division}
                                </td>
                                <td className="p-2 border">{rec.date}</td>
                                <td className="p-2 border">{rec.check_in ?? "-"}</td>
                                <td className="p-2 border">{rec.check_out ?? "-"}</td>
                                <td className="p-2 border capitalize">{rec.status}</td>
                                <td className="p-2 border">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => openDeleteModal(rec.id)}
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
