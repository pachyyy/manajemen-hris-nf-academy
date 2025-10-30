import AppLayout from "@/layouts/app-layout";
import { laporan } from "@/routes";
import { BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Laporan',
        href: laporan().url,
    },
];

export default function Laporan() {
    return(
        <AppLayout breadcrumbs={breadcrumbs}>
            <div>
                <h1>
                    This is laporan page
                </h1>
            </div>
        </AppLayout>
    )
}
