import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Link, router } from '@inertiajs/react';
import { MoreHorizontalIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';

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
    updated_at: string;
    assigned_to_user?: User;
    assigned_by_user?: User;
}

interface TaskIndexProps {
    tasks: Task[];
    canManage: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Penugasan',
        href: '/tasks',
    },
];

// Helper function to format date
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    };
    return date.toLocaleDateString('en-GB', options);
};

// Get badge variant for priority
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

// Get badge variant for status
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

export default function TaskIndex({ tasks, canManage }: TaskIndexProps) {
    const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDeleteClick = (id: number) => {
        setTaskToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (taskToDelete === null) return;

        router.delete(`/tasks/${taskToDelete}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setTaskToDelete(null);
            },
            onError: (errors) => {
                console.error('Failed to delete task:', errors);
                setIsDeleteModalOpen(false);
                setTaskToDelete(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Task Management</h1>
                        <p className="text-muted-foreground">
                            Manage and track your tasks
                        </p>
                    </div>
                    {canManage && (
                        <Link href="/tasks/create">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Create Task
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center text-muted-foreground"
                                    >
                                        No tasks found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tasks.map((task) => (
                                    <TableRow key={task.id}>
                                        <TableCell className="font-medium">
                                            {task.title}
                                        </TableCell>
                                        <TableCell>
                                            {task.assigned_to_user?.name ||
                                                'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {getPriorityBadge(task.priority)}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(task.status)}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(task.deadline)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                    >
                                                        <MoreHorizontalIcon className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/tasks/${task.id}`}
                                                        >
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {canManage && (
                                                        <>
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={`/tasks/${task.id}/edit`}
                                                                >
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDeleteClick(
                                                                        task.id,
                                                                    )
                                                                }
                                                                className="text-destructive"
                                                            >
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Task"
                description="Are you sure you want to delete this task? This action cannot be undone."
            />
        </AppLayout>
    );
}
