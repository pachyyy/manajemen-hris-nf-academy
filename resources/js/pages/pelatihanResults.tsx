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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Rekap Hasil Pelatihan – {training.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit}>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Nilai</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Catatan</TableHead>
                                        <TableHead>Sertifikat</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.results.map((r, idx) => (
                                        <TableRow key={r.user_id}>
                                            <TableCell>{r.name}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    className="w-24"
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
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={r.status ?? ""}
                                                    onValueChange={(value) =>
                                                        setData("results", [
                                                            ...data.results.slice(
                                                                0,
                                                                idx
                                                            ),
                                                            {
                                                                ...data.results[idx],
                                                                status: value,
                                                            },
                                                            ...data.results.slice(
                                                                idx + 1
                                                            ),
                                                        ])
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pass">Lulus</SelectItem>
                                                        <SelectItem value="fail">
                                                            Tidak Lulus
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="text"
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
                                            </TableCell>
                                            <TableCell>
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
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
