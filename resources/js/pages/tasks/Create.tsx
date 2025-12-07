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

interface CreateTaskProps {
    staffUsers: User[];
    divisions: Division[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Penugasan',
        href: '/tasks',
    },
    {
        title: 'Create Task',
        href: '/tasks/create',
    },
];

export default function CreateTask({ staffUsers, divisions }: CreateTaskProps) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        division: '',
        assigned_to: '',
        priority: 'medium',
        deadline: '',
        attachment: null as File | null,
    });

    // Filter employees by selected division
    const filteredEmployees = useMemo(() => {
        if (!data.division) return staffUsers;
        return staffUsers.filter((user) => user.division === data.division);
    }, [data.division, staffUsers]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/tasks', {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-3xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Task</CardTitle>
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

                            <div className="flex flex-col gap-2">
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
                                <Label htmlFor="division">
                                    Division{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
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
                                    disabled={!data.division}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                data.division
                                                    ? 'Select employee'
                                                    : 'Select division first'
                                            }
                                        />
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
                                            <SelectValue />
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
                                <Label htmlFor="attachment">
                                    Attachment (Optional)
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
                                    {processing ? 'Creating...' : 'Create Task'}
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
