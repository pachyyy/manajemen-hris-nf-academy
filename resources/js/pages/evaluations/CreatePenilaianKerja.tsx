import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, EditIcon, GripVerticalIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penilaian Kerja', href: '/penilaian-kerja' },
];

interface Indicator {
    id?: number;
    title: string;
    description: string;
    type: 'rating' | 'number' | 'text';
    order_index: number;
    is_default: boolean;
}

interface DefaultCriterion {
    id: number;
    title: string;
    description: string;
    type: 'rating' | 'number' | 'text';
    order_index: number;
    is_default: boolean;
}

interface CreatePenilaianKerjaProps {
    defaultCriteria: DefaultCriterion[];
}

export default function CreatePenilaianKerja({ defaultCriteria }: CreatePenilaianKerjaProps) {
    const [showIndicatorForm, setShowIndicatorForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [indicatorForm, setIndicatorForm] = useState<Indicator>({
        title: '',
        description: '',
        type: 'rating',
        order_index: 0,
        is_default: false,
    });

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        period_code: '',
        period_type: 'quarterly',
        start_date: '',
        end_date: '',
        self_assessment_deadline: '',
        hr_evaluation_deadline: '',
        description: '',
        guidelines: '',
        auto_create_evaluations: true,
        indicators: [] as Indicator[],
    });

    // Initialize with default criteria on mount
    useEffect(() => {
        // If no default criteria from database, use hardcoded defaults
        const defaultsToUse = defaultCriteria.length > 0 ? defaultCriteria : [
            {
                id: 0,
                title: 'Kualitas Kerja',
                description: 'Penilaian terhadap kualitas hasil kerja yang dihasilkan, termasuk ketelitian, keakuratan, dan kelengkapan',
                type: 'rating' as const,
                order_index: 1,
                is_default: true,
            },
            {
                id: 0,
                title: 'Produktivitas',
                description: 'Penilaian terhadap jumlah dan kecepatan penyelesaian pekerjaan sesuai target yang ditetapkan',
                type: 'rating' as const,
                order_index: 2,
                is_default: true,
            },
            {
                id: 0,
                title: 'Inisiatif dan Inovasi',
                description: 'Kemampuan memberikan ide baru, solusi kreatif, dan mengambil inisiatif dalam pekerjaan',
                type: 'rating' as const,
                order_index: 3,
                is_default: true,
            },
            {
                id: 0,
                title: 'Kerja Sama Tim',
                description: 'Kemampuan bekerja sama dengan rekan kerja, berbagi informasi, dan mendukung tim',
                type: 'rating' as const,
                order_index: 4,
                is_default: true,
            },
            {
                id: 0,
                title: 'Kedisiplinan',
                description: 'Kepatuhan terhadap peraturan perusahaan, ketepatan waktu, dan komitmen terhadap tugas',
                type: 'rating' as const,
                order_index: 5,
                is_default: true,
            },
        ];

        const initialIndicators: Indicator[] = defaultsToUse.map(criterion => ({
            id: criterion.id || undefined,
            title: criterion.title,
            description: criterion.description,
            type: criterion.type,
            order_index: criterion.order_index,
            is_default: true,
        }));
        setData('indicators', initialIndicators);
    }, []);

    const handleAddIndicator = () => {
        if (!indicatorForm.title.trim()) {
            alert('Judul indikator harus diisi!');
            return;
        }

        const newIndicator: Indicator = {
            ...indicatorForm,
            order_index: data.indicators.length + 1,
        };

        setData('indicators', [...data.indicators, newIndicator]);
        resetIndicatorForm();
        setShowIndicatorForm(false);
    };

    const handleEditIndicator = (index: number) => {
        setIndicatorForm(data.indicators[index]);
        setEditingIndex(index);
        setShowIndicatorForm(true);
    };

    const handleUpdateIndicator = () => {
        if (editingIndex === null || !indicatorForm.title.trim()) return;

        const updatedIndicators = [...data.indicators];
        updatedIndicators[editingIndex] = indicatorForm;
        setData('indicators', updatedIndicators);
        resetIndicatorForm();
        setShowIndicatorForm(false);
        setEditingIndex(null);
    };

    const handleDeleteIndicator = (index: number) => {
        if (data.indicators[index].is_default) {
            alert('Indikator default tidak dapat dihapus. Anda dapat mengeditnya.');
            return;
        }
        const updatedIndicators = data.indicators.filter((_, i) => i !== index);
        // Reorder
        updatedIndicators.forEach((ind, i) => ind.order_index = i + 1);
        setData('indicators', updatedIndicators);
    };

    const resetIndicatorForm = () => {
        setIndicatorForm({
            title: '',
            description: '',
            type: 'rating',
            order_index: 0,
            is_default: false,
        });
    };

    const generatePeriodCode = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const quarter = Math.ceil((now.getMonth() + 1) / 3);

        let suggestion = '';
        switch (data.period_type) {
            case 'monthly':
                suggestion = `EVAL-${year}-${month}`;
                break;
            case 'quarterly':
                suggestion = `EVAL-${year}-Q${quarter}`;
                break;
            case 'yearly':
                suggestion = `EVAL-${year}`;
                break;
        }
        setData('period_code', suggestion);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (data.indicators.length === 0) {
            alert('Minimal tambahkan 1 indikator penilaian!');
            return;
        }

        post('/api/evaluation-periods');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Buat Rencana Penilaian Kerja</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Periode</CardTitle>
                            <CardDescription>
                                Tentukan nama, kode, dan rentang waktu periode evaluasi
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Nama Periode <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: Evaluasi Kinerja Q1 2025"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="period_code">
                                        Kode Periode <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="period_code"
                                            value={data.period_code}
                                            onChange={(e) => setData('period_code', e.target.value)}
                                            placeholder="Contoh: EVAL-2025-Q1"
                                            className="flex-1"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={generatePeriodCode}
                                        >
                                            Auto
                                        </Button>
                                    </div>
                                    {errors.period_code && (
                                        <p className="text-sm text-destructive">{errors.period_code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="period_type">
                                        Tipe Periode <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.period_type}
                                        onValueChange={(value) => setData('period_type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="monthly">Bulanan</SelectItem>
                                            <SelectItem value="quarterly">Triwulan</SelectItem>
                                            <SelectItem value="yearly">Tahunan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="start_date">
                                        Tanggal Mulai <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                        required
                                    />
                                    {errors.start_date && (
                                        <p className="text-sm text-destructive">{errors.start_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">
                                        Tanggal Selesai <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                        required
                                    />
                                    {errors.end_date && (
                                        <p className="text-sm text-destructive">{errors.end_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="self_assessment_deadline">
                                        Deadline Self Assessment
                                    </Label>
                                    <Input
                                        id="self_assessment_deadline"
                                        type="date"
                                        value={data.self_assessment_deadline}
                                        onChange={(e) => setData('self_assessment_deadline', e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Deadline karyawan mengisi penilaian mandiri
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="auto_create"
                                    checked={data.auto_create_evaluations}
                                    onCheckedChange={(checked) =>
                                        setData('auto_create_evaluations', checked as boolean)
                                    }
                                />
                                <Label htmlFor="auto_create" className="cursor-pointer font-normal">
                                    Otomatis buat evaluasi untuk semua karyawan aktif
                                </Label>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="guidelines">Panduan Penilaian</Label>
                                <Textarea
                                    id="guidelines"
                                    value={data.guidelines}
                                    onChange={(e) => setData('guidelines', e.target.value)}
                                    placeholder="Panduan untuk karyawan dalam mengisi penilaian..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Indikator Penilaian Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Indikator Penilaian</CardTitle>
                                    <CardDescription>
                                        Konfigurasikan aspek-aspek yang akan dinilai dalam evaluasi
                                    </CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                        resetIndicatorForm();
                                        setEditingIndex(null);
                                        setShowIndicatorForm(!showIndicatorForm);
                                    }}
                                >
                                    <PlusIcon className="h-4 w-4 mr-1" />
                                    Tambah Indikator
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {showIndicatorForm && (
                                <Card className="border-2 border-primary">
                                    <CardHeader>
                                        <CardTitle className="text-base">
                                            {editingIndex !== null ? 'Edit Indikator' : 'Tambah Indikator Baru'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="indicator_title">
                                                Nama Indikator <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="indicator_title"
                                                placeholder="contoh: Komunikasi Efektif"
                                                value={indicatorForm.title}
                                                onChange={(e) =>
                                                    setIndicatorForm({ ...indicatorForm, title: e.target.value })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="indicator_type">
                                                Tipe Input <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={indicatorForm.type}
                                                onValueChange={(value: 'rating' | 'number' | 'text') =>
                                                    setIndicatorForm({ ...indicatorForm, type: value })
                                                }
                                            >
                                                <SelectTrigger id="indicator_type">
                                                    <SelectValue placeholder="Pilih tipe input" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="rating">Rating (1-5)</SelectItem>
                                                    <SelectItem value="number">Angka</SelectItem>
                                                    <SelectItem value="text">Teks</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground">
                                                Rating untuk penilaian 1-5, Angka untuk nilai numerik bebas, Teks untuk deskripsi
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="indicator_description">Deskripsi</Label>
                                            <Textarea
                                                id="indicator_description"
                                                placeholder="Jelaskan aspek yang dinilai..."
                                                value={indicatorForm.description}
                                                onChange={(e) =>
                                                    setIndicatorForm({
                                                        ...indicatorForm,
                                                        description: e.target.value,
                                                    })
                                                }
                                                rows={3}
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setShowIndicatorForm(false);
                                                    setEditingIndex(null);
                                                    resetIndicatorForm();
                                                }}
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={
                                                    editingIndex !== null
                                                        ? handleUpdateIndicator
                                                        : handleAddIndicator
                                                }
                                            >
                                                {editingIndex !== null ? 'Update' : 'Tambah'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {data.indicators.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Belum ada indikator penilaian. Klik tombol "Tambah Indikator" untuk menambahkan.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {data.indicators.map((indicator, index) => (
                                        <Card key={index}>
                                            <CardContent className="flex items-center justify-between p-4">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <GripVerticalIcon className="h-5 w-5 text-muted-foreground mt-1" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium">{indicator.title}</span>
                                                            {indicator.is_default && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Default
                                                                </Badge>
                                                            )}
                                                            <Badge variant="outline" className="text-xs">
                                                                {indicator.type === 'rating' ? 'Rating 1-5' : 
                                                                 indicator.type === 'number' ? 'Angka' : 'Teks'}
                                                            </Badge>
                                                        </div>
                                                        {indicator.description && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {indicator.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditIndicator(index)}
                                                    >
                                                        <EditIcon className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteIndicator(index)}
                                                        disabled={indicator.is_default}
                                                    >
                                                        <TrashIcon className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-900">
                                    <strong>Tips:</strong> Indikator default tidak dapat dihapus tetapi dapat diedit.
                                    Anda dapat menambahkan indikator kustom sesuai kebutuhan evaluasi.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing || data.indicators.length === 0}>
                            {processing ? 'Menyimpan...' : 'Simpan & Aktifkan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
