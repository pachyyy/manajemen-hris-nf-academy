import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Absensi',
        href: '/dashboard/absensi',
    },
];

export default function Absensi() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Absensi" />
            <div>
                <h1>This is Absensi page</h1>
            </div>
            <div>
                <Button>Add Absen</Button>
            </div>
        </AppLayout>
    );
}
