import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface UpdateLaporanProps {
    id: string;
}

export default function UpdateLaporan({ id }: UpdateLaporanProps) {
    const [title, setTitle] = useState('');
    const [isiLaporan, setIsiLaporan] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLaporan = async () => {
            try {
                const response = await fetch(`/api/laporan/${id}`, {
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
                setTitle(data.title);
                setIsiLaporan(data.isi_laporan);
            } catch (err) {
                setError('Failed to fetch laporan data.');
                console.error(err);
            }
        };

        fetchLaporan();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch(`/api/laporan/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
                body: JSON.stringify({
                    title,
                    isi_laporan: isiLaporan,
                }),
                credentials: 'include',
            });
            router.visit('/laporan/staff');
        } catch (err) {
            setError('Failed to update laporan.');
            console.error(err);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Laporan',
            href: '/laporan/staff',
        },
        {
            title: 'Update',
            href: `/laporan/update/${id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Update Laporan" />
            <div className="p-3">
                <h1 className="text-3xl font-bold">Update Laporan</h1>
                {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor="title">Title</label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="isi_laporan">Isi Laporan</label>
                        <Textarea
                            id="isi_laporan"
                            value={isiLaporan}
                            onChange={(e) => setIsiLaporan(e.target.value)}
                        />
                    </div>
                    <Button type="submit">Update</Button>
                </form>
            </div>
        </AppLayout>
    );
}
