import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Answer {
    id: number;
    criteria: {
        id: number;
        title: string;
        description: string;
        type: string;
    };
    self_score: number | null;
    self_note: string | null;
    hr_score: number | null;
    hr_feedback: string | null;
}

interface Evaluation {
    id: number;
    employee_name: string;
    employee_division: string;
    employee_position: string;
    period: {
        id: number;
        name: string;
        period_code: string;
    };
    status: string;
    total_score: number | null;
    grade: string | null;
    manager_feedback: string | null;
    answers: Answer[];
}

interface ShowProps {
    evaluation: Evaluation;
    canManage: boolean;
}

export default function Show({ evaluation, canManage }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Evaluations', href: '/evaluations' },
        { title: 'Details', href: '#' },
    ];

    const { data, setData, post, processing } = useForm({
        manager_feedback: evaluation.manager_feedback || '',
    });

    const handleApprove: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/api/evaluations/${evaluation.id}/approve`);
    };

    const handleRequestRevision: FormEventHandler = (e) => {
        e.preventDefault();
        if (confirm('Anda yakin ingin meminta revisi untuk evaluasi ini?')) {
            post(`/api/evaluations/${evaluation.id}/request-revision`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-4xl space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle>{evaluation.period.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {evaluation.employee_name} - {evaluation.employee_division}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Badge
                                    variant={
                                        evaluation.status === 'reviewed'
                                            ? 'default'
                                            : evaluation.status === 'submitted'
                                            ? 'secondary'
                                            : 'outline'
                                    }
                                >
                                    {evaluation.status}
                                </Badge>
                                {evaluation.grade && (
                                    <Badge variant="outline">Grade: {evaluation.grade}</Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {evaluation.total_score !== null && (
                            <div className="mb-4 rounded-lg border bg-muted/50 p-4">
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                    Nilai Rata-rata
                                </p>
                                <div className="flex items-baseline gap-3">
                                    <p className="text-4xl font-bold text-primary">
                                        {Number(evaluation.total_score).toFixed(2)}
                                    </p>
                                    <span className="text-sm text-muted-foreground">dari skala 1-5</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {evaluation.answers.map((answer) => (
                        <Card key={answer.id}>
                            <CardHeader>
                                <CardTitle className="text-lg">{answer.criteria.title}</CardTitle>
                                {answer.criteria.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {answer.criteria.description}
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>
                                        {answer.criteria.type === 'rating' && 'Penilaian Karyawan (1-5)'}
                                        {answer.criteria.type === 'number' && 'Nilai Karyawan'}
                                        {answer.criteria.type === 'text' && 'Jawaban Karyawan'}
                                    </Label>
                                    
                                    {answer.criteria.type === 'rating' ? (
                                        <div className="flex gap-2">
                                            <Input 
                                                value={answer.self_score || '-'} 
                                                disabled 
                                                className="w-20 text-center font-semibold text-lg"
                                            />
                                            {answer.self_score && (
                                                <Badge variant="outline" className="self-center">
                                                    {answer.self_score === 5 ? 'Sangat Baik' :
                                                     answer.self_score === 4 ? 'Baik' :
                                                     answer.self_score === 3 ? 'Cukup' :
                                                     answer.self_score === 2 ? 'Kurang' : 'Sangat Kurang'}
                                                </Badge>
                                            )}
                                        </div>
                                    ) : answer.criteria.type === 'number' ? (
                                        <Input 
                                            value={answer.self_score || '-'} 
                                            disabled 
                                            className="w-32 font-semibold text-lg"
                                        />
                                    ) : (
                                        <Textarea 
                                            value={answer.self_note || '-'} 
                                            disabled 
                                            rows={4} 
                                            className="bg-muted"
                                        />
                                    )}
                                </div>

                                {answer.self_note && answer.criteria.type !== 'text' && (
                                    <div className="space-y-2">
                                        <Label>Catatan Karyawan</Label>
                                        <Textarea value={answer.self_note} disabled rows={2} className="bg-muted" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {canManage && evaluation.status === 'submitted' && (
                        <form onSubmit={handleApprove} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Umpan Balik untuk Karyawan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        value={data.manager_feedback}
                                        onChange={(e) => setData('manager_feedback', e.target.value)}
                                        placeholder="Berikan umpan balik keseluruhan untuk karyawan..."
                                        rows={6}
                                        required
                                    />
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleRequestRevision}
                                    disabled={processing}
                                >
                                    Minta Revisi
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                                    {processing ? 'Memproses...' : 'Setujui Evaluasi'}
                                </Button>
                            </div>
                        </form>
                    )}

                    {evaluation.manager_feedback && evaluation.status === 'reviewed' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Umpan Balik Manager</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{evaluation.manager_feedback}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
