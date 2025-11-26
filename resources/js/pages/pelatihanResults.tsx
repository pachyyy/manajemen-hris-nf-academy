import React from "react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, useForm } from "@inertiajs/react";

interface ResultRow {
    user_id: number;
    name: string;
    score: number | string;
    status: string; // "pass" | "fail"
    notes?: string | null;
    certificate_url?: string | null;
}

interface Props {
    training: { id: number; title: string };
    rows: ResultRow[];
}

export default function PelatihanResults({ training, rows }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Pelatihan", href: "/pelatihan" },
        { title: training.title, href: `/trainings/${training.id}/results` },
    ];

    const { data, setData, post, processing } = useForm({
        results: rows,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/trainings/${training.id}/results`, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Hasil - ${training.title}`} />
            <div className="p-4 space-y-4">
                <h1 className="text-xl font-semibold">
                    Rekap Hasil Pelatihan – {training.title}
                </h1>

                <form
                    onSubmit={submit}
                    className="border border-sidebar-border/70 rounded-xl bg-white dark:bg-neutral-900 overflow-hidden"
                >
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-neutral-800">
                            <tr>
                                <th className="px-4 py-2 text-left">Nama</th>
                                <th className="px-4 py-2 text-left">Nilai</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Catatan</th>
                                <th className="px-4 py-2 text-left">
                                    Sertifikat
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.results.map((r, idx) => (
                                <tr
                                    key={r.user_id}
                                    className="border-t border-sidebar-border/40 dark:border-neutral-700"
                                >
                                    <td className="px-4 py-2">{r.name}</td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            className="w-20 border rounded px-2 py-1 text-xs bg-transparent"
                                            value={r.score ?? ""}
                                            onChange={(e) =>
                                                setData("results", [
                                                    ...data.results.slice(
                                                        0,
                                                        idx
                                                    ),
                                                    {
                                                        ...data.results[idx],
                                                        score: e.target.value,
                                                    },
                                                    ...data.results.slice(
                                                        idx + 1
                                                    ),
                                                ])
                                            }
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <select
                                            className="border rounded px-2 py-1 text-xs bg-transparent"
                                            value={r.status ?? ""}
                                            onChange={(e) =>
                                                setData("results", [
                                                    ...data.results.slice(
                                                        0,
                                                        idx
                                                    ),
                                                    {
                                                        ...data.results[idx],
                                                        status: e.target.value,
                                                    },
                                                    ...data.results.slice(
                                                        idx + 1
                                                    ),
                                                ])
                                            }
                                        >
                                            <option value="">Pilih</option>
                                            <option value="pass">Lulus</option>
                                            <option value="fail">
                                                Tidak Lulus
                                            </option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            className="w-full border rounded px-2 py-1 text-xs bg-transparent"
                                            value={r.notes ?? ""}
                                            onChange={(e) =>
                                                setData("results", [
                                                    ...data.results.slice(
                                                        0,
                                                        idx
                                                    ),
                                                    {
                                                        ...data.results[idx],
                                                        notes: e.target.value,
                                                    },
                                                    ...data.results.slice(
                                                        idx + 1
                                                    ),
                                                ])
                                            }
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        {r.certificate_url ? (
                                            <a
                                                href={r.certificate_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-blue-600 underline"
                                            >
                                                Lihat Sertifikat
                                            </a>
                                        ) : (
                                            <span className="text-xs text-gray-400">
                                                Belum ada sertifikat
                                            </span>
                                        )}
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
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
