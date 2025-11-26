import React from "react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, router } from "@inertiajs/react";

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string; // "task" | "deadline" | "feedback" | ...
    read_at?: string | null;
    created_at: string;
}

interface Props {
    notifications: Notification[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Notifikasi", href: "/notifications" },
];

export default function Notifikasi({ notifications }: Props) {
    const markAsRead = (id: number) => {
        router.put(`/notifications/${id}/read`, {}, { preserveScroll: true });
    };

    const markAll = () => {
        router.put("/notifikasi/read-all", {}, { preserveScroll: true });
    };

    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifikasi" />
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-semibold">
                        Notifikasi{" "}
                        {unreadCount > 0 && (
                            <span className="text-sm font-normal text-gray-500">
                                ({unreadCount} belum dibaca)
                            </span>
                        )}
                    </h1>
                    {notifications.length > 0 && (
                        <button
                            onClick={markAll}
                            className="px-3 py-1 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Tandai semua sudah dibaca
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        Belum ada notifikasi.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`p-3 rounded-xl border text-sm flex justify-between items-start gap-2 ${
                                    n.read_at
                                        ? "bg-white dark:bg-neutral-900 border-sidebar-border/70"
                                        : "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-700"
                                }`}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold">
                                            {n.title}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800">
                                            {n.type}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-700 dark:text-gray-200 whitespace-pre-line">
                                        {n.message}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {new Date(
                                            n.created_at
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                {!n.read_at && (
                                    <button
                                        onClick={() => markAsRead(n.id)}
                                        className="text-[10px] px-2 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        Tandai dibaca
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
