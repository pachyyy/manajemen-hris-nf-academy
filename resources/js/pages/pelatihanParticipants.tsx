import React from "react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, useForm } from "@inertiajs/react";

interface ParticipantRow {
    id: number;
    user_id: number;
    name: string;
    email: string;
    attendance_status: string | null; // "present" | "absent" | "late"
}

interface Training {
    id: number;
    title: string;
}

interface Props {
    training: Training;
    participants: ParticipantRow[];
}

export default function PelatihanParticipants({
    training,
    participants,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Pelatihan", href: "/pelatihan" },
        {
            title: `Peserta – ${training.title}`,
            href: `/trainings/${training.id}/participants`,
        },
    ];

    const { data, setData, post, processing } = useForm({
        participants: participants.map((p) => ({
            id: p.id,
            user_id: p.user_id,
            name: p.name,
            email: p.email,
            attendance_status: p.attendance_status ?? "present",
        })),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/trainings/${training.id}/attendance`, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Peserta - ${training.title}`} />

            <div className="p-4 space-y-4">
                <h1 className="text-xl font-semibold">
                    Peserta Pelatihan – {training.title}
                </h1>

                <form
                    onSubmit={submit}
                    className="border border-sidebar-border/70 rounded-xl bg-white dark:bg-neutral-900 overflow-hidden"
                >
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-neutral-800">
                            <tr>
                                <th className="px-4 py-2 text-left">Nama</th>
                                <th className="px-4 py-2 text-left">Email</th>
                                <th className="px-4 py-2 text-left">
                                    Kehadiran
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.participants.map((p, idx) => (
                                <tr
                                    key={p.id}
                                    className="border-t border-sidebar-border/40 dark:border-neutral-700"
                                >
                                    <td className="px-4 py-2">{p.name}</td>
                                    <td className="px-4 py-2">{p.email}</td>
                                    <td className="px-4 py-2">
                                        <select
                                            className="border rounded px-2 py-1 text-xs bg-transparent"
                                            value={p.attendance_status}
                                            onChange={(e) =>
                                                setData("participants", [
                                                    ...data.participants.slice(
                                                        0,
                                                        idx
                                                    ),
                                                    {
                                                        ...data.participants[
                                                            idx
                                                        ],
                                                        attendance_status:
                                                            e.target.value,
                                                    },
                                                    ...data.participants.slice(
                                                        idx + 1
                                                    ),
                                                ])
                                            }
                                        >
                                            <option value="present">Hadir</option>
                                            <option value="absent">
                                                Tidak Hadir
                                            </option>
                                            <option value="late">
                                                Terlambat
                                            </option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end p-3 gap-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                            Simpan Kehadiran
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
