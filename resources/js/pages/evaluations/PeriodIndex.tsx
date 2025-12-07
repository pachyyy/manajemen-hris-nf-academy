import { Badge, BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

interface Period {
    id: number;
    name: string;
    period_code: string;
    period_type: string;
    start_date: string;
    end_date: string;
    status: 'draft' | 'active' | 'closed';
    creator: { id: number; name: string; email: string };
}

interface PeriodIndexProps {
    periods: Period[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Evaluasi Kerja', href: '/evaluation-periods' },
];

export default function Index({ periods }: PeriodIndexProps) {
    const getStatusBadge = (status: string) => {
        const variants: Record<string, BadgeProps['variant']> = {
            draft: 'secondary',
            active: 'default',
            closed: 'outline',
        };
        return <Badge variant={variants[status]}>{status}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Evaluasi Kerja</h1>
                    <Link href="/penilaian-kerja/create">
                        <Button>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Buat Rencana Penilaian Kerja
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Period Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created By</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {periods.map((period) => (
                                    <TableRow key={period.id}>
                                        <TableCell className="font-medium">
                                            {period.name}
                                        </TableCell>
                                        <TableCell>{period.period_code}</TableCell>
                                        <TableCell>{period.period_type}</TableCell>
                                        <TableCell>
                                            {period.start_date} - {period.end_date}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(period.status)}</TableCell>
                                        <TableCell>{period.creator.name}</TableCell>
                                        <TableCell>
                                            <Link href={`/evaluation-periods/${period.id}`}>
                                                <Button variant="outline" size="sm">
                                                    View Details
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
