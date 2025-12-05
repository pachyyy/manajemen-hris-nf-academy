import React from "react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, useForm, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDownIcon } from "lucide-react";

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
        start_time: training.start_time.split(' ')[0], // Get only date part
        end_time: training.end_time.split(' ')[0], // Get only date part
        location: training.location ?? "",
        quota: training.quota?.toString() ?? "",
        status: training.status ?? "draft",
    });

    const [startTime, setStartTime] = React.useState<Date | undefined>(
        training.start_time ? new Date(training.start_time) : undefined
    );
    const [openStartTime, setOpenStartTime] = React.useState(false);
    const [endTime, setEndTime] = React.useState<Date | undefined>(
        training.end_time ? new Date(training.end_time) : undefined
    );
    const [openEndTime, setOpenEndTime] = React.useState(false);

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
                                onValueChange={(value) => setData("type", value)}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Pilih Tipe" />
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
                             <Popover open={openStartTime} onOpenChange={setOpenStartTime}>
                                 <PopoverTrigger asChild>
                                     <Button
                                         variant="outline"
                                         id="start_time"
                                         className="w-full justify-between font-normal"
                                     >
                                         {startTime ? startTime.toLocaleDateString("en-CA") : "Pilih tanggal"}
                                         <ChevronDownIcon />
                                     </Button>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-auto p-0" align="start">
                                     <Calendar
                                         mode="single"
                                         selected={startTime}
                                         onSelect={(selectedDate) => {
                                             setStartTime(selectedDate);
                                             setOpenStartTime(false);
                                             setData("start_time", selectedDate ? selectedDate.toLocaleDateString("en-CA") : "");
                                         }}
                                     />
                                 </PopoverContent>
                             </Popover>
                        </div>
                        <div>
                            <Label htmlFor="end_time">Waktu Selesai</Label>
                             <Popover open={openEndTime} onOpenChange={setOpenEndTime}>
                                 <PopoverTrigger asChild>
                                     <Button
                                         variant="outline"
                                         id="end_time"
                                         className="w-full justify-between font-normal"
                                     >
                                         {endTime ? endTime.toLocaleDateString("en-CA") : "Pilih tanggal"}
                                         <ChevronDownIcon />
                                     </Button>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-auto p-0" align="start">
                                     <Calendar
                                         mode="single"
                                         selected={endTime}
                                         onSelect={(selectedDate) => {
                                             setEndTime(selectedDate);
                                             setOpenEndTime(false);
                                             setData("end_time", selectedDate ? selectedDate.toLocaleDateString("en-CA") : "");
                                         }}
                                     />
                                 </PopoverContent>
                             </Popover>
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
                                onValueChange={(value) => setData("status", value)}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Pilih Status" />
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
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
