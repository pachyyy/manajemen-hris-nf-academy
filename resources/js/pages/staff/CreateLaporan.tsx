import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function CreateLaporan() {
    const [title, setTitle] = useState('');
    const [isiLaporan, setIsiLaporan] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/laporan', {
                method: 'POST',
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
            setError('Failed to submit laporan.');
            console.error(err);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Laporan',
            href: '/laporan/staff',
        },
        {
            title: 'Create',
            href: '/laporan/create',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Laporan" />
            <div className="p-3">
                <h1 className="text-3xl font-bold">Create Laporan</h1>
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
                    <Button type="submit">Submit</Button>
                </form>
            </div>
        </AppLayout>
    );
}
