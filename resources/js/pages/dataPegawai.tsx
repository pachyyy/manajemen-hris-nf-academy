import AppLayout from '@/layouts/app-layout';
import { dataPegawai } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data pegawai',
        href: dataPegawai().url,
    },
];

interface Employee {
    id?: number;
    division: string;
    position: string;
    join_date: string;
    contact: string;
    status: 'aktif' | 'cuti' | 'resign';
    document_path?: string | null;
    user?: { id: number; name: string };
    user_id?: number;
}

const DataPegawai: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [form, setForm] = useState<Employee>({
        division: '',
        position: '',
        join_date: '',
        contact: '',
        status: 'aktif',
        user_id: 1, // default user_id sementara
    });
    const [editingId, setEditingId] = useState<number | null>(null);

    const loadEmployees = async () => {
        try {
            const res = await fetch('/api/employees');
            const data = await res.json();
            setEmployees(data);
        } catch (error) {
            console.error('Gagal memuat data:', error);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const res = await fetch('/api/employees');
                const data = await res.json();
                if (isMounted) setEmployees(data);
            } catch (error) {
                console.error('Gagal memuat data:', error);
            }
        };
        fetchData();
        return () => {
            isMounted = false;
        };
    }, []);

    // Submit form (create atau update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const method = editingId ? 'PUT' : 'POST';
        const url = editingId
            ? `/api/employees/${editingId}`
            : '/api/employees';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });

        setForm({
            division: '',
            position: '',
            join_date: '',
            contact: '',
            status: 'aktif',
            user_id: 1,
        });
        setEditingId(null);

        // Re-fetch setelah CRUD
        await loadEmployees();
    };

    // Edit data
    const handleEdit = (emp: Employee) => {
        setForm({
            division: emp.division,
            position: emp.position,
            join_date: emp.join_date,
            contact: emp.contact,
            status: emp.status,
            user_id: emp.user_id,
        });
        setEditingId(emp.id!);
    };

    // Hapus data
    const handleDelete = async (id?: number) => {
        if (!id || !confirm('Hapus pegawai ini?')) return;
        await fetch(`/api/employees/${id}`, { method: 'DELETE' });
        await loadEmployees();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">📋 Data Pegawai</h1>

                {/* Form Tambah / Edit */}
                <form onSubmit={handleSubmit} className="mb-6 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            className="rounded border p-2"
                            placeholder="Divisi"
                            value={form.division}
                            onChange={(e) =>
                                setForm({ ...form, division: e.target.value })
                            }
                        />
                        <input
                            className="rounded border p-2"
                            placeholder="Posisi"
                            value={form.position}
                            onChange={(e) =>
                                setForm({ ...form, position: e.target.value })
                            }
                        />
                        <input
                            type="date"
                            className="rounded border p-2"
                            value={form.join_date}
                            onChange={(e) =>
                                setForm({ ...form, join_date: e.target.value })
                            }
                        />
                        <input
                            className="rounded border p-2"
                            placeholder="Kontak"
                            value={form.contact}
                            onChange={(e) =>
                                setForm({ ...form, contact: e.target.value })
                            }
                        />
                        <select
                            className="rounded border p-2"
                            value={form.status}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    status: e.target
                                        .value as Employee['status'],
                                })
                            }
                        >
                            <option value="aktif">Aktif</option>
                            <option value="cuti">Cuti</option>
                            <option value="resign">Resign</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="rounded bg-blue-600 px-4 py-2 text-white"
                    >
                        {editingId ? 'Update' : 'Tambah'} Pegawai
                    </button>
                </form>

                {/* Tabel Data */}
                <table className="w-full border text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">ID</th>
                            <th className="border p-2">Nama User</th>
                            <th className="border p-2">Divisi</th>
                            <th className="border p-2">Posisi</th>
                            <th className="border p-2">Tanggal Bergabung</th>
                            <th className="border p-2">Status</th>
                            <th className="border p-2 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => (
                            <tr key={emp.id}>
                                <td className="border p-2">{emp.id}</td>
                                <td className="border p-2">
                                    {emp.user?.name ?? '—'}
                                </td>
                                <td className="border p-2">{emp.division}</td>
                                <td className="border p-2">{emp.position}</td>
                                <td className="border p-2">{emp.join_date}</td>
                                <td className="border p-2 capitalize">
                                    {emp.status}
                                </td>
                                <td className="border p-2 text-center">
                                    <button
                                        onClick={() => handleEdit(emp)}
                                        className="mr-2 rounded bg-yellow-400 px-2 py-1 text-white"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(emp.id)}
                                        className="rounded bg-red-600 px-2 py-1 text-white"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
};

export default DataPegawai;

