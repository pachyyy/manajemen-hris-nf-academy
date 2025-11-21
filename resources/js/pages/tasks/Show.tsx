import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import { CalendarIcon, DownloadIcon, FileIcon, UserIcon } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Task {
    id: number;
    title: string;
    description: string;
    assigned_to: number;
    assigned_by: number;
    priority: 'low' | 'medium' | 'high';
    deadline: string;
    status: 'belum' | 'proses' | 'selesai';
    attachment: string | null;
    created_at: string;
    assigned_to_user?: User;
    assigned_by_user?: User;
}

interface ShowTaskProps {
    task: Task;
    canManage: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Penugasan',
        href: '/tasks',
    },
    {
        title: 'Task Details',
        href: '#',
    },
];

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    };
    return date.toLocaleDateString('en-GB', options);
};

const getPriorityBadge = (priority: string) => {
    switch (priority) {
        case 'high':
            return <Badge variant="destructive">High</Badge>;
        case 'medium':
            return <Badge variant="secondary">Medium</Badge>;
        case 'low':
            return <Badge variant="outline">Low</Badge>;
        default:
            return <Badge>{priority}</Badge>;
    }
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'selesai':
            return (
                <Badge variant="default" className="bg-green-600">
                    Selesai
                </Badge>
            );
        case 'proses':
            return (
                <Badge variant="secondary" className="bg-blue-600 text-white">
                    Proses
                </Badge>
            );
        case 'belum':
            return <Badge variant="outline">Belum Mulai</Badge>;
        default:
            return <Badge>{status}</Badge>;
    }
};

export default function ShowTask({ task, canManage }: ShowTaskProps) {
    const [isEditingStatus, setIsEditingStatus] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        status: task.status,
        attachment: null as File | null,
    });

    const submitStatusUpdate: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/tasks/${task.id}/status`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingStatus(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{task.title}</h1>
                        <div className="mt-2 flex gap-2">
                            {getPriorityBadge(task.priority)}
                            {getStatusBadge(task.status)}
                        </div>
                    </div>
                    {canManage && (
                        <Link href={`/tasks/${task.id}/edit`}>
                            <Button>Edit Task</Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Task Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="text-muted-foreground">
                                Description
                            </Label>
                            <p className="mt-1 whitespace-pre-wrap">
                                {task.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <UserIcon className="h-4 w-4" />
                                    Assigned To
                                </Label>
                                <p className="mt-1 font-medium">
                                    {task.assigned_to_user?.name || 'N/A'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {task.assigned_to_user?.email}
                                </p>
                            </div>

                            <div>
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <UserIcon className="h-4 w-4" />
                                    Assigned By
                                </Label>
                                <p className="mt-1 font-medium">
                                    {task.assigned_by_user?.name || 'N/A'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {task.assigned_by_user?.email}
                                </p>
                            </div>
                        </div>

                        <div>
                            <Label className="flex items-center gap-2 text-muted-foreground">
                                <CalendarIcon className="h-4 w-4" />
                                Deadline
                            </Label>
                            <p className="mt-1 font-medium">
                                {formatDate(task.deadline)}
                            </p>
                        </div>

                        {task.attachment && (
                            <div>
                                <Label className="flex items-center gap-2 text-muted-foreground">
                                    <FileIcon className="h-4 w-4" />
                                    Attachment
                                </Label>
                                <a
                                    href={`/storage/${task.attachment}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 flex items-center gap-2 text-primary hover:underline"
                                >
                                    <DownloadIcon className="h-4 w-4" />
                                    {task.attachment.split('/').pop()}
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {!canManage && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Update Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!isEditingStatus ? (
                                <Button
                                    onClick={() => setIsEditingStatus(true)}
                                >
                                    Update Status
                                </Button>
                            ) : (
                                <form
                                    onSubmit={submitStatusUpdate}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="status">
                                            Status{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) =>
                                                setData('status', value as any)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="belum">
                                                    Belum Mulai
                                                </SelectItem>
                                                <SelectItem value="proses">
                                                    Proses
                                                </SelectItem>
                                                <SelectItem value="selesai">
                                                    Selesai
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-destructive">
                                                {errors.status}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="attachment">
                                            Upload Attachment (Optional)
                                        </Label>
                                        <Input
                                            id="attachment"
                                            type="file"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            onChange={(e) =>
                                                setData(
                                                    'attachment',
                                                    e.target.files?.[0] || null,
                                                )
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Upload proof of task completion
                                            (PDF, DOC, DOCX, JPG, JPEG, PNG -
                                            Max 5MB)
                                        </p>
                                        {errors.attachment && (
                                            <p className="text-sm text-destructive">
                                                {errors.attachment}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Updating...'
                                                : 'Update Status'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setIsEditingStatus(false)
                                            }
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
