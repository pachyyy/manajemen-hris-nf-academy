import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';

interface Evaluation {
    id: number;
    period: { id: number; name: string; period_code: string; status: string };
    status: string;
    total_score: number | null;
    grade: string | null;
    submitted_at: string | null;
    reviewed_at: string | null;
}

interface SelfAssessmentListProps {
    evaluations: Evaluation[];
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Evaluations', href: '/evaluations/self-assessment' },
];

export default function SelfAssessmentList({ evaluations, error }: SelfAssessmentListProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">My Evaluations</h1>

                {error && (
                    <Card className="border-destructive">
                        <CardContent className="p-6">
                            <p className="text-destructive">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {evaluations.length === 0 && !error && (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            No evaluation periods available yet.
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4">
                    {evaluations.map((evaluation) => (
                        <Card key={evaluation.id}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold">{evaluation.period.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {evaluation.period.period_code}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={
                                                    evaluation.status === 'reviewed'
                                                        ? 'default'
                                                        : evaluation.status === 'submitted'
                                                        ? 'secondary'
                                                        : evaluation.status === 'revision_requested'
                                                        ? 'destructive'
                                                        : 'outline'
                                                }
                                            >
                                                {evaluation.status === 'reviewed'
                                                    ? 'Reviewed'
                                                    : evaluation.status === 'submitted'
                                                    ? 'Submitted'
                                                    : evaluation.status === 'revision_requested'
                                                    ? 'Perlu Revisi'
                                                    : 'Pending'}
                                            </Badge>
                                            {evaluation.grade && (
                                                <Badge variant="outline">Grade: {evaluation.grade}</Badge>
                                            )}
                                            {evaluation.total_score && (
                                                <span className="text-sm font-medium">
                                                    Skor: {Number(evaluation.total_score).toFixed(2)}/5.0
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {evaluation.status === 'pending' ||
                                        evaluation.status === 'revision_requested' ? (
                                            <Link href={`/evaluations/self-assessment/${evaluation.period.id}`}>
                                                <Button>
                                                    {evaluation.status === 'revision_requested'
                                                        ? 'Revisi Penilaian'
                                                        : 'Isi Penilaian'}
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href={`/evaluations/${evaluation.id}`}>
                                                <Button variant="outline">Lihat Detail</Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
