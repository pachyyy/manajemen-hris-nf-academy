import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';

interface Evaluation {
    id: number;
    period: {
        id: number;
        name: string;
        period_code: string;
    };
    total_score: number;
    grade: string;
    manager_feedback: string;
    reviewed_at: string;
}

interface ResultsProps {
    evaluations: Evaluation[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Results', href: '/evaluations/results' },
];

export default function Results({ evaluations }: ResultsProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">My Evaluation Results</h1>

                {evaluations.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            No reviewed evaluations yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {evaluations.map((evaluation) => (
                            <Card key={evaluation.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle>{evaluation.period.name}</CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {evaluation.period.period_code}
                                            </p>
                                        </div>
                                        <Badge variant="outline">Grade: {evaluation.grade}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Score</p>
                                        <p className="text-2xl font-bold">
                                            {Number(evaluation.total_score).toFixed(2)}
                                        </p>
                                    </div>

                                    {evaluation.manager_feedback && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Manager Feedback
                                            </p>
                                            <p className="mt-1 text-sm">{evaluation.manager_feedback}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Reviewed: {evaluation.reviewed_at}
                                        </p>
                                        <Link href={`/evaluations/${evaluation.id}`}>
                                            <button className="text-sm text-blue-600 hover:underline">
                                                View Details
                                            </button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
