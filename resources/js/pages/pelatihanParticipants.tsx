import React from "react";
import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Peserta Pelatihan – {training.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit}>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Kehadiran</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.participants.map((p, idx) => (
                                        <TableRow key={p.id}>
                                            <TableCell>{p.name}</TableCell>
                                            <TableCell>{p.email}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={p.attendance_status}
                                                    onValueChange={(value) =>
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
                                                                    value,
                                                            },
                                                            ...data.participants.slice(
                                                                idx + 1
                                                            ),
                                                        ])
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="present">Hadir</SelectItem>
                                                        <SelectItem value="absent">
                                                            Tidak Hadir
                                                        </SelectItem>
                                                        <SelectItem value="late">
                                                            Terlambat
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="flex justify-end p-3 gap-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    Simpan Kehadiran
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
