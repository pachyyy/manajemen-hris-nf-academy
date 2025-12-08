import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
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
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { MoreHorizontalIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    };
    return date.toLocaleDateString('en-GB', options);
};

interface Laporan {
    id: number;
    title: string;
    isi_laporan: string;
    status: 'pending' | 'accepted' | 'declined';
    created_at: string;
}

export default function LaporanStaff() {
    const [error, setError] = useState<string | null>(null);
    const [laporans, setLaporans] = useState<Laporan[]>([]);
    const [laporanToDelete, setLaporanToDelete] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/laporan/staff', {
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setLaporans(data);
        } catch (error) {
            console.error('Failed to fetch laporans: ', error);
            setError('Failed to fetch laporans.');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteClick = (id: number) => {
        setLaporanToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (laporanToDelete === null) return;

        try {
            const response = await fetch(`/api/laporan/${laporanToDelete}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            fetchData();
        } catch (err) {
            console.error('Failed to delete laporan:', err);
            setError('Failed to delete laporan.');
        } finally {
            setIsDeleteModalOpen(false);
            setLaporanToDelete(null);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Laporan',
            href: '/laporan/staff',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Laporan' />
            <div className="align-center flex p-3">
                <h1 className="text-3xl font-bold">Laporan Saya</h1>
                <div className="absolute right-2 z-10">
                    <Link href={'/laporan/create'}>
                        <Button className="cursor-pointer">Add Laporan</Button>
                    </Link>
                </div>
            </div>

            {error && (
                <div className="mt-4 text-center text-red-500">{error}</div>
            )}

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
            />

            <Table>
                <TableCaption>A list of your reports</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Date Creation</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {laporans.map((laporan) => (
                        <TableRow key={laporan.id}>
                            <TableCell>{laporan.title}</TableCell>
                            <TableCell>{formatDate(laporan.created_at)}</TableCell>
                            <TableCell className='capitalize'>{laporan.status}</TableCell>
                            <TableCell>
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
                                            <Link
                                                href={laporan.status === 'accepted' ? '#' : `/laporan/update/${laporan.id}`}
                                            >
                                                <DropdownMenuItem disabled={laporan.status === 'accepted'}>
                                                    Update
                                                </DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuItem
                                                onSelect={() => {
                                                    handleDeleteClick(laporan.id)
                                                }}
                                                disabled={laporan.status === 'accepted'}
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </AppLayout>
    );
}
