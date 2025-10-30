import AppLayout from "@/layouts/app-layout";
import { evaluasiKerja } from "@/routes";
import { BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Evaluasi Kerja',
        href: evaluasiKerja().url,
    },
];

export default function EvaluasiKerja() {
    return(
        <AppLayout breadcrumbs={breadcrumbs}>
            <div>
                <h1>
                    This is Evaluasi Kerja Page
                </h1>
            </div>
        </AppLayout>
    )
}
