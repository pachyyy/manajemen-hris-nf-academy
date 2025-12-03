import { Badge } from '@/components/ui/badge';
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

interface Evaluation {
    id: number;
    employee_name: string;
    employee_division: string;
    period: { id: number; name: string; period_code: string; status: string };
    status: string;
    total_score: number | null;
    grade: string | null;
}

interface IndexProps {
    evaluations: Evaluation[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Evaluations', href: '/evaluations' },
];

export default function Index({ evaluations }: IndexProps) {
    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            pending: 'secondary',
            submitted: 'default',
            reviewed: 'outline',
            revision_requested: 'destructive',
        };
        return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Employee Evaluations</h1>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Division</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {evaluations.map((evaluation) => (
                                    <TableRow key={evaluation.id}>
                                        <TableCell className="font-medium">
                                            {evaluation.employee_name}
                                        </TableCell>
                                        <TableCell>{evaluation.employee_division}</TableCell>
                                        <TableCell>{evaluation.period.name}</TableCell>
                                        <TableCell>{getStatusBadge(evaluation.status)}</TableCell>
                                        <TableCell>
                                            {evaluation.total_score ? Number(evaluation.total_score).toFixed(2) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {evaluation.grade && (
                                                <Badge variant="outline">{evaluation.grade}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/evaluations/${evaluation.id}`}>
                                                <button className="text-sm text-blue-600 hover:underline">
                                                    View Details
                                                </button>
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
