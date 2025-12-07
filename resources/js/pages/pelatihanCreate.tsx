import React from "react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, useForm, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Pelatihan", href: "/pelatihan" },
    { title: "Buat Pelatihan", href: "/trainings/create" },
];

export default function PelatihanCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        description: "",
        trainer_name: "",
        type: "online",
        start_time: "",
        end_time: "",
        location: "",
        quota: "",
        status: "draft",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/trainings", {
            onSuccess: () => router.visit("/pelatihan"),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Pelatihan" />

            <div className="p-4 max-w-3xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Buat Jadwal Pelatihan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <Label htmlFor="title">Judul</Label>
                                <Input
                                    id="title"
                                    type="text"
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
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="trainer_name">Trainer / Pemateri</Label>
                                    <Input
                                        id="trainer_name"
                                        type="text"
                                        value={data.trainer_name}
                                        onChange={(e) =>
                                            setData("trainer_name", e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="type">Tipe</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) =>
                                            setData("type", value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="online">Online</SelectItem>
                                            <SelectItem value="offline">Offline</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="start_time">Waktu Mulai</Label>
                                    <Input
                                        id="start_time"
                                        type="datetime-local"
                                        value={data.start_time}
                                        onChange={(e) =>
                                            setData("start_time", e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="end_time">Waktu Selesai</Label>
                                    <Input
                                        id="end_time"
                                        type="datetime-local"
                                        value={data.end_time}
                                        onChange={(e) =>
                                            setData("end_time", e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="location">Lokasi / Link</Label>
                                <Input
                                    id="location"
                                    type="text"
                                    value={data.location}
                                    onChange={(e) =>
                                        setData("location", e.target.value)
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="quota">Kuota</Label>
                                    <Input
                                        id="quota"
                                        type="number"
                                        min={1}
                                        value={data.quota}
                                        onChange={(e) =>
                                            setData("quota", e.target.value)
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) =>
                                            setData("status", value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="open">Open (Bisa daftar)</SelectItem>
                                            <SelectItem value="ongoing">Sedang berjalan</SelectItem>
                                            <SelectItem value="completed">Selesai</SelectItem>
                                            <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <Button
                                    type="button"
                                    onClick={() => router.visit("/pelatihan")}
                                    variant={"destructive"}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    Simpan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
