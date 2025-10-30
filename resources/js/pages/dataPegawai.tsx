import AppLayout from "@/layouts/app-layout";
import { dataPegawai } from "@/routes";
import { BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data pegawai',
        href: dataPegawai().url,
    },
];

export default function DataPegawai() {
    return(
        <AppLayout breadcrumbs={breadcrumbs}>
            <div>
                <h1>
                    This is Data Pegawai
                </h1>
            </div>
        </AppLayout>
    );
}
