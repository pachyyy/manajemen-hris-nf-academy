import { Button } from '@/components/ui/button';
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
import { Head } from '@inertiajs/react';
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
    user: {
        name: string;
    };
}

export default function LaporanAdmin() {
    const [error, setError] = useState<string | null>(null);
    const [laporans, setLaporans] = useState<Laporan[]>([]);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/laporan/admin', {
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

    const handleAction = async (id: number, action: 'accept' | 'decline') => {
        try {
            const response = await fetch(`/api/laporan/${id}/${action}`, {
                method: 'POST',
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
            console.error(`Failed to ${action} laporan:`, err);
            setError(`Failed to ${action} laporan.`);
        }
    };

    const handleExport = async () => {
        try {
            const response = await fetch('/api/laporan/export', {
                method: 'GET',
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

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.message || `HTTP error! status: ${response.status}`;
                throw new Error(errorMsg);
            }

            if (data.download_url) {
                const link = document.createElement('a');
                link.href = data.download_url;
                link.setAttribute('download', 'laporan.csv');
                document.body.appendChild(link);
                link.click();
                link.remove();
                setError(null); // Clear previous errors on success
            } else {
                setError('No download URL received.');
            }
        } catch (err: any) {
            console.error('Failed to export laporan:', err);
            setError(`Failed to export laporan: ${err.message}`);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Laporan',
            href: '/laporan/admin',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Laporan Management' />
            <div className="align-center flex p-3">
                <h1 className="text-3xl font-bold">Laporan Management</h1>
                <div className="absolute right-2 z-10">
                    <Button className="cursor-pointer" onClick={handleExport}>Export to CSV</Button>
                </div>
            </div>

            {error && (
                <div className="mt-4 text-center text-red-500">{error}</div>
            )}

            <Table>
                <TableCaption>A list of user reports</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Isi Laporan</TableHead>
                        <TableHead>Date Creation</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {laporans.map((laporan) => (
                        <TableRow key={laporan.id}>
                            <TableCell>{laporan.title}</TableCell>
                            <TableCell>{laporan.isi_laporan}</TableCell>
                            <TableCell>{formatDate(laporan.created_at)}</TableCell>
                            <TableCell>{laporan.user.name}</TableCell>
                            <TableCell className='capitalize'>{laporan.status}</TableCell>
                            <TableCell>
                                <div className='flex gap-2'>
                                <Button
                                    onClick={() => handleAction(laporan.id, 'accept')}
                                    disabled={laporan.status !== 'pending'}
                                >
                                    Accept
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleAction(laporan.id, 'decline')}
                                    disabled={laporan.status !== 'pending'}
                                >
                                    Decline
                                </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </AppLayout>
    );
}
