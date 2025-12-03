import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { router, useForm } from '@inertiajs/react';
import { PlusIcon, TrashIcon, Eye, ClipboardCheck } from 'lucide-react';
import { useState } from 'react';

interface Criteria {
    id: number;
    title: string;
    description: string;
    type: string;
    order_index: number;
}

interface Period {
    id: number;
    name: string;
    period_code: string;
    period_type: string;
    start_date: string;
    end_date: string;
    status: string;
    description: string;
    guidelines: string;
    criteria: Criteria[];
}

interface Evaluation {
    id: number;
    employee_id: number;
    employee_name: string;
    employee_position: string;
    employee_division: string;
    status: string;
    total_score: number | null;
    grade: string | null;
    reviewer_name: string | null;
    reviewed_at: string | null;
    submitted_at: string | null;
}

interface ShowProps {
    period: Period;
    totalEmployees: number;
    evaluationStats: {
        total: number;
        pending: number;
        submitted: number;
        reviewed: number;
    };
    evaluations: Evaluation[];
}

export default function Show({ period, totalEmployees, evaluationStats, evaluations }: ShowProps) {
    const [showCriteriaForm, setShowCriteriaForm] = useState(false);
    const { data, setData, post, reset, processing } = useForm({
        title: '',
        description: '',
        type: 'rating',
        order_index: period.criteria.length,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Evaluation Periods', href: '/evaluation-periods' },
        { title: period.name, href: `/evaluation-periods/${period.id}` },
    ];

    const handleAddCriteria = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/api/evaluation-periods/${period.id}/criteria`, {
            onSuccess: () => {
                reset();
                setShowCriteriaForm(false);
            },
        });
    };

    const handleOpenPeriod = () => {
        if (confirm('Are you sure you want to open this period? This will create evaluations for all employees.')) {
            router.post(`/api/evaluation-periods/${period.id}/open`);
        }
    };

    const handleClosePeriod = () => {
        if (confirm('Are you sure you want to close this period?')) {
            router.post(`/api/evaluation-periods/${period.id}/close`);
        }
    };

    const handleDeleteCriteria = (criteriaId: number) => {
        if (confirm('Are you sure you want to delete this criteria?')) {
            router.delete(`/api/evaluation-periods/${period.id}/criteria/${criteriaId}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{period.name}</h1>
                        <p className="text-muted-foreground">{period.period_code}</p>
                    </div>
                    <div className="flex gap-2">
                        {period.status === 'draft' && (
                            <Button onClick={handleOpenPeriod}>Open Period</Button>
                        )}
                        {period.status === 'active' && (
                            <Button variant="outline" onClick={handleClosePeriod}>
                                Close Period
                            </Button>
                        )}
                        <Badge variant={period.status === 'active' ? 'default' : 'secondary'}>
                            {period.status}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Total Evaluations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{evaluationStats.total}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-yellow-600">{evaluationStats.pending}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Submitted</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-blue-600">{evaluationStats.submitted}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Reviewed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-600">{evaluationStats.reviewed}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Evaluation Criteria</CardTitle>
                            {period.status === 'draft' && (
                                <Button onClick={() => setShowCriteriaForm(!showCriteriaForm)} size="sm">
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Add Criteria
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {showCriteriaForm && period.status === 'draft' && (
                            <form onSubmit={handleAddCriteria} className="mb-6 space-y-4 rounded-lg border p-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g., Work Quality"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Brief description"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <Button type="submit" disabled={processing}>
                                        Add
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowCriteriaForm(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        )}

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Type</TableHead>
                                    {period.status === 'draft' && <TableHead>Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {period.criteria.map((criteria) => (
                                    <TableRow key={criteria.id}>
                                        <TableCell>{criteria.order_index + 1}</TableCell>
                                        <TableCell className="font-medium">{criteria.title}</TableCell>
                                        <TableCell>{criteria.description}</TableCell>
                                        <TableCell>{criteria.type}</TableCell>
                                        {period.status === 'draft' && (
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteCriteria(criteria.id)}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Daftar Evaluasi Karyawan */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Evaluasi Karyawan</CardTitle>
                        <CardDescription>
                            Status evaluasi untuk semua karyawan dalam periode ini
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Karyawan</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">Skor</TableHead>
                                    <TableHead className="text-center">Grade</TableHead>
                                    <TableHead>Reviewer</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {evaluations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            Belum ada evaluasi
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    evaluations.map((evaluation) => (
                                        <TableRow key={evaluation.id}>
                                            <TableCell>
                                                <div className="font-medium">{evaluation.employee_name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {evaluation.employee_position} • {evaluation.employee_division}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
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
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {evaluation.total_score ? (
                                                    <span className="font-semibold text-primary">
                                                        {Number(evaluation.total_score).toFixed(2)}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {evaluation.grade ? (
                                                    <Badge variant="default">{evaluation.grade}</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{evaluation.reviewer_name || '-'}</span>
                                                {evaluation.reviewed_at && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {evaluation.reviewed_at}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {evaluation.status === 'submitted' ? (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => {
                                                            router.visit(`/evaluations/${evaluation.id}`);
                                                        }}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <ClipboardCheck className="h-4 w-4 mr-1" />
                                                        Review & Approve
                                                    </Button>
                                                ) : evaluation.status === 'reviewed' ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            router.visit(`/evaluations/${evaluation.id}`);
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View Details
                                                    </Button>
                                                ) : evaluation.status === 'revision_requested' ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            router.visit(`/evaluations/${evaluation.id}`);
                                                        }}
                                                        className="border-orange-600 text-orange-600 hover:bg-orange-50"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View Revision
                                                    </Button>
                                                ) : (
                                                    <Button variant="ghost" size="sm" disabled>
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Not Started
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
