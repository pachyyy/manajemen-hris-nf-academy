import AppLayout from '@/layouts/app-layout';
import { absensi } from '@/routes';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Absensi',
        href: absensi().url,
    },
];

export default function Absensi() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Absensi" />
            <div>
                <h1>This is Absensi page</h1>
            </div>
        </AppLayout>
    );
}
