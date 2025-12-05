import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { pelatihan } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { MoreHorizontalIcon } from 'lucide-react';

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
    is_registered: boolean;
}

interface Props {
    trainings: Training[];
    canManage: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pelatihan',
        href: pelatihan().url,
    },
];

export default function Pelatihan({ trainings, canManage }: Props) {
    const handleRegister = (id: number) => {
        router.post(`/trainings/${id}/register`);
    };

    const handleCancel = (id: number) => {
        router.delete(`/trainings/${id}/register`);
    };

    const goCreate = () => router.get('/trainings/create');
    const goEdit = (id: number) => router.get(`/trainings/${id}/edit`);
    const goParticipants = (id: number) =>
        router.get(`/trainings/${id}/participants`);
    const goResults = (id: number) => router.get(`/trainings/${id}/results`);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pelatihan" />

            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight">
                        Daftar Pelatihan Internal
                    </h1>

                    {canManage && (
                        <Button onClick={goCreate}>+ Buat Pelatihan</Button>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Judul</TableHead>
                                <TableHead>Trainer</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Peserta</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {trainings.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell>{t.title}</TableCell>

                                    <TableCell>
                                        {t.trainer_name ?? '-'}
                                    </TableCell>

                                    <TableCell className='uppercase font-bold'>{t.type}</TableCell>

                                    <TableCell>
                                        <div className="text-xs">
                                            {new Date(
                                                t.start_time,
                                            ).toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-gray-500">
                                            s/d{' '}
                                            {new Date(
                                                t.end_time,
                                            ).toLocaleString()}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <span className="rounded-full bg-gray-200 px-2 py-1 text-xs dark:bg-neutral-700">
                                            {t.status}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        {t.participants_count ?? 0}
                                        {t.quota ? ` / ${t.quota}` : ''}
                                    </TableCell>

                                    <TableCell>
                                        {/* STAFF */}
                                        {t.status === 'open' &&
                                            !canManage &&
                                            (t.is_registered ? (
                                                <>
                                                    <Button disabled>
                                                        Terdaftar
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            handleCancel(t.id)
                                                        }
                                                        variant={'destructive'}
                                                    >
                                                        Batal
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    onClick={() =>
                                                        handleRegister(t.id)
                                                    }
                                                >
                                                    Daftar
                                                </Button>
                                            ))}

                                        {/* ADMIN / HR */}
                                        {canManage && (
                                            <DropdownMenu modal={false}>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-label="Open menu">
                                                        <MoreHorizontalIcon />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    className="w-40"
                                                    align="end"
                                                >
                                                    <DropdownMenuGroup>
                                                        <DropdownMenuItem
                                                            onSelect={() => {
                                                                goEdit(t.id);
                                                            }}
                                                        >
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onSelect={() => {
                                                                goParticipants(
                                                                    t.id,
                                                                );
                                                            }}
                                                        >
                                                            Peserta
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onSelect={() => {
                                                                goResults(t.id);
                                                            }}
                                                        >
                                                            Hasil
                                                        </DropdownMenuItem>
                                                    </DropdownMenuGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

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
