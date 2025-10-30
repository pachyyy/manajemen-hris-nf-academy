import AppLayout from "@/layouts/app-layout";
import { penugasan } from "@/routes";
import { BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Penugasan',
        href: penugasan().url,
    },
];

export default function Penugasan() {
    return(
        <AppLayout breadcrumbs={breadcrumbs}>
            <div>
                <h1>
                    This is penugasan page
                </h1>
            </div>
        </AppLayout>
    );
}
