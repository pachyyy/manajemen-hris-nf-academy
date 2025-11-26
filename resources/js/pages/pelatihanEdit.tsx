import React from "react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, useForm, router } from "@inertiajs/react";

interface Training {
    id: number;
    title: string;
    description?: string | null;
    trainer_name?: string | null;
    type: string;
    start_time: string;
    end_time: string;
    location?: string | null;
    quota?: number | null;
    status: string;
}

interface Props {
    training: Training;
}

export default function PelatihanEdit({ training }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Pelatihan", href: "/pelatihan" },
        {
            title: `Edit - ${training.title}`,
            href: `/trainings/${training.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        title: training.title ?? "",
        description: training.description ?? "",
        trainer_name: training.trainer_name ?? "",
        type: training.type ?? "online",
        start_time: training.start_time,
        end_time: training.end_time,
        location: training.location ?? "",
        quota: training.quota?.toString() ?? "",
        status: training.status ?? "draft",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/trainings/${training.id}`, {
            onSuccess: () => router.visit("/pelatihan"),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${training.title}`} />

            <div className="p-4 max-w-3xl mx-auto">
                <h1 className="text-xl font-semibold mb-4">
                    Edit Pelatihan – {training.title}
                </h1>

                <form
                    onSubmit={submit}
                    className="space-y-4 bg-white dark:bg-neutral-900 border border-sidebar-border/70 rounded-xl p-4"
                >
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Judul
                        </label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2 text-sm bg-transparent"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                        />
                        {errors.title && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Deskripsi
                        </label>
                        <textarea
                            className="w-full border rounded px-3 py-2 text-sm bg-transparent"
                            rows={3}
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Trainer / Pemateri
                            </label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2 text-sm bg-transparent"
                                value={data.trainer_name}
                                onChange={(e) =>
                                    setData("trainer_name", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Tipe
                            </label>
                            <select
                                className="w-full border rounded px-3 py-2 text-sm bg-transparent"
                                value={data.type}
                                onChange={(e) =>
                                    setData("type", e.target.value)
                                }
                            >
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Waktu Mulai
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full border rounded px-3 py-2 text-sm bg-transparent"
                                value={data.start_time}
                                onChange={(e) =>
                                    setData("start_time", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Waktu Selesai
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full border rounded px-3 py-2 text-sm bg-transparent"
                                value={data.end_time}
                                onChange={(e) =>
                                    setData("end_time", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Lokasi / Link
                        </label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2 text-sm bg-transparent"
                            value={data.location}
                            onChange={(e) =>
                                setData("location", e.target.value)
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Kuota
                            </label>
                            <input
                                type="number"
                                min={1}
                                className="w-full border rounded px-3 py-2 text-sm bg-transparent"
                                value={data.quota}
                                onChange={(e) =>
                                    setData("quota", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Status
                            </label>
                            <select
                                className="w-full border rounded px-3 py-2 text-sm bg-transparent"
                                value={data.status}
                                onChange={(e) =>
                                    setData("status", e.target.value)
                                }
                            >
                                <option value="draft">Draft</option>
                                <option value="open">Open (Bisa daftar)</option>
                                <option value="ongoing">Sedang berjalan</option>
                                <option value="completed">Selesai</option>
                                <option value="cancelled">Dibatalkan</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                        <button
                            type="button"
                            onClick={() => router.visit("/pelatihan")}
                            className="px-4 py-2 rounded-lg border text-sm"
                        >
                            Batal
                        </button>
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
