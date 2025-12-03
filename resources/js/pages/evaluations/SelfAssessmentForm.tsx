import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
}

interface Evaluation {
    id: number;
    status: string;
    period: {
        id: number;
        name: string;
        guidelines: string;
    };
    answers: Answer[];
}

interface SelfAssessmentFormProps {
    evaluation: Evaluation;
}

export default function SelfAssessmentForm({ evaluation }: SelfAssessmentFormProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'My Evaluations', href: '/evaluations/self-assessment' },
        { title: 'Self Assessment', href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        answers: evaluation.answers.map((answer) => ({
            id: answer.id,
            self_score: answer.self_score || 0,
            self_note: answer.self_note || '',
        })),
    });

    const updateAnswer = (index: number, field: string, value: any) => {
        const newAnswers = [...data.answers];
        newAnswers[index] = { ...newAnswers[index], [field]: value };
        setData('answers', newAnswers);
    };

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/api/evaluations/${evaluation.id}/submit`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle>{evaluation.period.name} - Self Assessment</CardTitle>
                        {evaluation.period.guidelines && (
                            <p className="text-sm text-muted-foreground">{evaluation.period.guidelines}</p>
                        )}
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-8">
                            {evaluation.answers.map((answer, index) => (
                                <div key={answer.id} className="space-y-4 rounded-lg border p-4">
                                    <div>
                                        <h3 className="font-semibold">{answer.criteria.title}</h3>
                                        {answer.criteria.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {answer.criteria.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor={`score-${index}`}>
                                            {answer.criteria.type === 'rating' && 'Rating (1-5)'}
                                            {answer.criteria.type === 'number' && 'Nilai'}
                                            {answer.criteria.type === 'text' && 'Jawaban'}
                                            {' '}<span className="text-destructive">*</span>
                                        </Label>
                                        
                                        {answer.criteria.type === 'rating' ? (
                                            <Select
                                                value={data.answers[index].self_score.toString()}
                                                onValueChange={(value) =>
                                                    updateAnswer(index, 'self_score', parseInt(value))
                                                }
                                                required
                                            >
                                                <SelectTrigger id={`score-${index}`}>
                                                    <SelectValue placeholder="Pilih rating" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="5">5 - Sangat Baik</SelectItem>
                                                    <SelectItem value="4">4 - Baik</SelectItem>
                                                    <SelectItem value="3">3 - Cukup</SelectItem>
                                                    <SelectItem value="2">2 - Kurang</SelectItem>
                                                    <SelectItem value="1">1 - Sangat Kurang</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : answer.criteria.type === 'number' ? (
                                            <Input
                                                id={`score-${index}`}
                                                type="number"
                                                value={data.answers[index].self_score || ''}
                                                onChange={(e) =>
                                                    updateAnswer(index, 'self_score', parseFloat(e.target.value) || 0)
                                                }
                                                placeholder="Masukkan nilai angka"
                                                required
                                            />
                                        ) : (
                                            <Textarea
                                                id={`score-${index}`}
                                                value={data.answers[index].self_note}
                                                onChange={(e) => updateAnswer(index, 'self_note', e.target.value)}
                                                placeholder="Masukkan jawaban Anda"
                                                rows={4}
                                                required
                                            />
                                        )}
                                    </div>

                                    {answer.criteria.type !== 'text' && (
                                        <div className="space-y-2">
                                            <Label htmlFor={`note-${index}`}>Catatan Tambahan (Opsional)</Label>
                                            <Textarea
                                                id={`note-${index}`}
                                                value={data.answers[index].self_note}
                                                onChange={(e) => updateAnswer(index, 'self_note', e.target.value)}
                                                placeholder="Tambahkan catatan Anda di sini..."
                                                rows={3}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Mengirim...' : 'Kirim Penilaian'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
