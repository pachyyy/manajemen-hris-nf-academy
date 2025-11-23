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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    division?: string;
    position?: string;
}

interface Division {
    value: string;
    label: string;
}

interface Task {
    id: number;
    title: string;
    description: string;
    division?: string;
    assigned_to: number;
    priority: string;
    deadline: string;
    status: string;
    attachment: string | null;
}

interface EditTaskProps {
    task: Task;
    staffUsers: User[];
    divisions: Division[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Penugasan',
        href: '/tasks',
    },
    {
        title: 'Edit Task',
        href: '#',
    },
];

export default function EditTask({
    task,
    staffUsers,
    divisions,
}: EditTaskProps) {
    const { data, setData, post, processing, errors } = useForm({
        title: task.title,
        description: task.description,
        division: task.division || '',
        assigned_to: task.assigned_to.toString(),
        priority: task.priority,
        deadline: task.deadline,
        status: task.status,
        attachment: null as File | null,
        _method: 'PUT',
    });

    // Filter employees by selected division
    const filteredEmployees = useMemo(() => {
        if (!data.division) return staffUsers;
        return staffUsers.filter((user) => user.division === data.division);
    }, [data.division, staffUsers]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Debug: log what we're sending
        console.log('Submitting data:', data);
        console.log('Errors before submit:', errors);

        // Use POST with _method spoofing for file uploads
        post(`/tasks/${task.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => {
                console.log('Validation errors:', errors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-3xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Task</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Task Title{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder="Enter task title"
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Description{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Enter task description"
                                    rows={5}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="division">Division</Label>
                                <Select
                                    value={data.division}
                                    onValueChange={(value) => {
                                        setData('division', value);
                                        // Reset assigned_to when division changes
                                        setData('assigned_to', '');
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select division" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {divisions.map((div) => (
                                            <SelectItem
                                                key={div.value}
                                                value={div.value}
                                            >
                                                {div.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.division && (
                                    <p className="text-sm text-destructive">
                                        {errors.division}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="assigned_to">
                                    Assign To{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.assigned_to}
                                    onValueChange={(value) =>
                                        setData('assigned_to', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredEmployees &&
                                        filteredEmployees.length > 0 ? (
                                            filteredEmployees.map((user) => (
                                                <SelectItem
                                                    key={user.id}
                                                    value={user.id.toString()}
                                                >
                                                    {user.name}
                                                    {user.position && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {' '}
                                                            - {user.position}
                                                        </span>
                                                    )}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-sm text-muted-foreground">
                                                {data.division
                                                    ? 'No employees in this division'
                                                    : 'Select a division first'}
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.assigned_to && (
                                    <p className="text-sm text-destructive">
                                        {errors.assigned_to}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="priority">
                                        Priority{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={data.priority}
                                        onValueChange={(value) =>
                                            setData('priority', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">
                                                Low
                                            </SelectItem>
                                            <SelectItem value="medium">
                                                Medium
                                            </SelectItem>
                                            <SelectItem value="high">
                                                High
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.priority && (
                                        <p className="text-sm text-destructive">
                                            {errors.priority}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deadline">
                                        Deadline{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="deadline"
                                        type="date"
                                        value={data.deadline}
                                        onChange={(e) =>
                                            setData('deadline', e.target.value)
                                        }
                                    />
                                    {errors.deadline && (
                                        <p className="text-sm text-destructive">
                                            {errors.deadline}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">
                                    Status{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value) =>
                                        setData('status', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
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
                                    Attachment (Optional)
                                </Label>
                                {task.attachment && (
                                    <p className="text-sm text-muted-foreground">
                                        Current:{' '}
                                        {task.attachment.split('/').pop()}
                                    </p>
                                )}
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
                                    Accepted formats: PDF, DOC, DOCX, JPG, JPEG,
                                    PNG (Max 5MB)
                                </p>
                                {errors.attachment && (
                                    <p className="text-sm text-destructive">
                                        {errors.attachment}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Task'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
