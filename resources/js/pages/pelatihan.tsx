import React from "react";
import AppLayout from "@/layouts/app-layout";
import { pelatihan } from "@/routes";
import { BreadcrumbItem } from "@/types";
import { Head, router } from "@inertiajs/react";

// Props dari TrainingController@index
interface Training {
    id: number;
    title: string;
    description?: string;
    trainer_name?: string;
    type: string;
    start_time: string;
    end_time: string;
    location?: string;
    quota?: number | null;
    status: string;
    participants_count?: number;
}

interface Props {
    trainings: Training[];
    userRole?: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Pelatihan",
        href: pelatihan().url,
    },
];

export default function Pelatihan({ trainings, userRole }: Props) {
    const isAdminOrHr =
        userRole && ["admin", "hr", "HR"].includes(userRole.toString());

    const handleRegister = (id: number) => {
        router.post(`/trainings/${id}/register`);
    };

    const handleCancel = (id: number) => {
        router.delete(`/trainings/${id}/register`);
    };

    const goCreate = () => router.get("/trainings/create");
    const goEdit = (id: number) => router.get(`/trainings/${id}/edit`);
    const goParticipants = (id: number) =>
        router.get(`/trainings/${id}/participants`);
    const goResults = (id: number) => router.get(`/trainings/${id}/results`);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pelatihan" />

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">
                        Daftar Pelatihan Internal
                    </h1>

                    {isAdminOrHr && (
                        <button
                            onClick={goCreate}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                        >
                            + Buat Pelatihan
                        </button>
                    )}
                </div>

                <div className="border border-sidebar-border/70 dark:border-sidebar-border rounded-xl overflow-hidden">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-neutral-800">
                            <tr>
                                <th className="px-4 py-2 text-left">Judul</th>
                                <th className="px-4 py-2 text-left">Trainer</th>
                                <th className="px-4 py-2 text-left">Tipe</th>
                                <th className="px-4 py-2 text-left">Waktu</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-center">Peserta</th>
                                <th className="px-4 py-2 text-left">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {trainings.map((t) => (
                                <tr
                                    key={t.id}
                                    className="border-t border-sidebar-border/40 dark:border-neutral-700"
                                >
                                    <td className="px-4 py-2 font-medium">
                                        {t.title}
                                    </td>

                                    <td className="px-4 py-2">
                                        {t.trainer_name ?? "-"}
                                    </td>

                                    <td className="px-4 py-2 uppercase text-xs">
                                        {t.type}
                                    </td>

                                    <td className="px-4 py-2">
                                        <div className="text-xs">
                                            {new Date(t.start_time).toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-gray-500">
                                            s/d{" "}
                                            {new Date(t.end_time).toLocaleString()}
                                        </div>
                                    </td>

                                    <td className="px-4 py-2">
                                        <span className="px-2 py-1 rounded-full text-xs bg-gray-200 dark:bg-neutral-700">
                                            {t.status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2 text-center">
                                        {t.participants_count ?? 0}
                                        {t.quota ? ` / ${t.quota}` : ""}
                                    </td>

                                    <td className="px-4 py-2 space-x-2">
                                        {/* STAFF */}
                                        {t.status === "open" && !isAdminOrHr && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        handleRegister(t.id)
                                                    }
                                                    className="px-3 py-1 text-xs rounded bg-green-600 text-white"
                                                >
                                                    Daftar
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleCancel(t.id)
                                                    }
                                                    className="px-3 py-1 text-xs rounded bg-yellow-500 text-white"
                                                >
                                                    Batal
                                                </button>
                                            </>
                                        )}

                                        {/* ADMIN / HR */}
                                        {isAdminOrHr && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        goEdit(t.id)
                                                    }
                                                    className="px-3 py-1 text-xs rounded bg-indigo-600 text-white"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        goParticipants(t.id)
                                                    }
                                                    className="px-3 py-1 text-xs rounded bg-gray-700 text-white"
                                                >
                                                    Peserta
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        goResults(t.id)
                                                    }
                                                    className="px-3 py-1 text-xs rounded bg-purple-600 text-white"
                                                >
                                                    Hasil
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {trainings.length === 0 && (
                        <div className="p-4 text-sm text-gray-500">
                            Belum ada pelatihan.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
