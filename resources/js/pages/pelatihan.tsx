import AppLayout from "@/layouts/app-layout";
import { pelatihan } from "@/routes";
import { BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pelatihan',
        href: pelatihan().url,
    },
];

export default function Pelatihan() {
    return(
        <AppLayout breadcrumbs={breadcrumbs}>
            <div>
                <h1>
                    This is pelatihan page
                </h1>
            </div>
        </AppLayout>
    )
}
