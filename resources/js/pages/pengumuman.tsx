import React from "react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, useForm } from "@inertiajs/react";

interface Announcement {
    id: number;
    title: string;
    type: string;
    content: string;
    start_date?: string | null;
    end_date?: string | null;
    is_pinned?: boolean;
    created_at: string;
}

interface Props {
    announcements: Announcement[];
    canManage?: boolean; // true untuk HR/Admin
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Pengumuman HR", href: "/pengumuman" },
];

export default function Pengumuman({ announcements, canManage }: Props) {
    const { data, setData, post, reset, processing, errors } = useForm({
        title: "",
        type: "schedule",
        content: "",
        start_date: "",
        end_date: "",
        is_pinned: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/pengumuman", {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengumuman HR" />
            <div className="p-4 space-y-4">
                <h1 className="text-xl font-semibold">Pengumuman HR</h1>

                {canManage && (
                    <form
                        onSubmit={submit}
                        className="bg-white dark:bg-neutral-900 border border-sidebar-border/70 rounded-xl p-4 space-y-3"
                    >
                        <h2 className="font-medium text-sm">
                            Tambah Pengumuman
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium mb-1">
                                    Judul
                                </label>
                                <input
                                    type="text"
                                    className="w-full border rounded px-2 py-1 text-sm bg-transparent"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData("title", e.target.value)
                                    }
                                />
                                {errors.title && (
                                    <p className="text-xs text-red-500">
                                        {errors.title}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">
                                    Tipe
                                </label>
                                <select
                                    className="w-full border rounded px-2 py-1 text-sm bg-transparent"
                                    value={data.type}
                                    onChange={(e) =>
                                        setData("type", e.target.value)
                                    }
                                >
                                    <option value="schedule">Jadwal</option>
                                    <option value="event">Event</option>
                                    <option value="collective_leave">
                                        Cuti Bersama
                                    </option>
                                    <option value="policy">Kebijakan</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Isi
                            </label>
                            <textarea
                                className="w-full border rounded px-2 py-1 text-sm bg-transparent"
                                rows={3}
                                value={data.content}
                                onChange={(e) =>
                                    setData("content", e.target.value)
                                }
                            />
                            {errors.content && (
                                <p className="text-xs text-red-500">
                                    {errors.content}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                            <div>
                                <label className="block text-xs font-medium mb-1">
                                    Mulai Berlaku
                                </label>
                                <input
                                    type="date"
                                    className="w-full border rounded px-2 py-1 text-sm bg-transparent"
                                    value={data.start_date}
                                    onChange={(e) =>
                                        setData("start_date", e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1">
                                    Selesai Berlaku
                                </label>
                                <input
                                    type="date"
                                    className="w-full border rounded px-2 py-1 text-sm bg-transparent"
                                    value={data.end_date}
                                    onChange={(e) =>
                                        setData("end_date", e.target.value)
                                    }
                                />
                            </div>
                            <label className="flex items-center gap-2 text-xs">
                                <input
                                    type="checkbox"
                                    checked={data.is_pinned}
                                    onChange={(e) =>
                                        setData("is_pinned", e.target.checked)
                                    }
                                />
                                Pin di paling atas
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 disabled:opacity-50"
                        >
                            Simpan Pengumuman
                        </button>
                    </form>
                )}

                <div className="space-y-3">
                    {announcements.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            Belum ada pengumuman yang aktif.
                        </p>
                    ) : (
                        announcements.map((a) => (
                            <div
                                key={a.id}
                                className="bg-white dark:bg-neutral-900 border border-sidebar-border/70 rounded-xl p-4 flex flex-col gap-1"
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <h3 className="font-semibold text-sm">
                                            {a.title}
                                        </h3>
                                        <p className="text-[11px] text-gray-500">
                                            {a.type} •{" "}
                                            {a.start_date
                                                ? `Berlaku ${a.start_date}${
                                                      a.end_date
                                                          ? " - " + a.end_date
                                                          : ""
                                                  }`
                                                : "Tanpa tanggal khusus"}
                                        </p>
                                    </div>
                                    {a.is_pinned && (
                                        <span className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                            PINNED
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm whitespace-pre-line">
                                    {a.content}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    Dibuat:{" "}
                                    {new Date(
                                        a.created_at
                                    ).toLocaleString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
