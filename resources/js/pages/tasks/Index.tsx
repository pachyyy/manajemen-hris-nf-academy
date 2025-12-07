import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { Head, Link, router } from '@inertiajs/react';
import { FilterIcon, MoreHorizontalIcon, PlusIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Employee {
    id: number;
    name: string;
    division?: string;
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

interface Filters {
    status?: string;
    priority?: string;
    division?: string;
    assigned_to?: string;
    deadline_from?: string;
    deadline_to?: string;
    sort_by?: string;
    sort_order?: string;
}

interface TaskIndexProps {
    tasks: Task[];
    canManage: boolean;
    employees?: Employee[];
    divisions?: Division[];
    filters?: Filters;
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

export default function TaskIndex({
    tasks,
    canManage,
    employees = [],
    divisions = [],
    filters = {},
}: TaskIndexProps) {
    console.log('Props received:', {
        tasks,
        canManage,
        employees,
        divisions,
        filters,
    });

    const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const [filterData, setFilterData] = useState<Filters>({
        status: filters?.status || '',
        priority: filters?.priority || '',
        division: filters?.division || '',
        assigned_to: filters?.assigned_to || '',
        deadline_from: filters?.deadline_from || '',
        deadline_to: filters?.deadline_to || '',
        sort_by: filters?.sort_by || 'created_at',
        sort_order: filters?.sort_order || 'desc',
    });

    const handleFilterChange = (key: string, value: string) => {
        setFilterData((prev) => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        // Remove empty values
        const cleanedFilters = Object.fromEntries(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            Object.entries(filterData).filter(([_, value]) => value !== ''),
        );

        router.get('/tasks', cleanedFilters as Record<string, string>, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setFilterData({
            status: '',
            priority: '',
            division: '',
            assigned_to: '',
            deadline_from: '',
            deadline_to: '',
            sort_by: 'created_at',
            sort_order: 'desc',
        });
        router.get('/tasks', {} as Record<string, string>, {
            preserveState: true,
            preserveScroll: true,
        });
    };

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
            <Head title='Penugasan' />
            <div className="space-y-4">
                <div className="flex items-center justify-between p-2">
                    <div>
                        <h1 className="text-3xl font-bold">Penugasan</h1>
                        <p className="text-muted-foreground">
                            Atur dan lacak tugas pegawai
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <FilterIcon className="mr-2 h-4 w-4" />
                            {showFilters
                                ? 'Hide Filter & Sort'
                                : 'Filter & Sort'}
                        </Button>
                        {canManage && (
                            <Link href="/tasks/create">
                                <Button>
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Create Task
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {/* Status Filter */}
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={filterData.status || 'all'}
                                        onValueChange={(value) =>
                                            handleFilterChange(
                                                'status',
                                                value === 'all' ? '' : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Status
                                            </SelectItem>
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
                                </div>

                                {/* Priority Filter */}
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select
                                        value={filterData.priority || 'all'}
                                        onValueChange={(value) =>
                                            handleFilterChange(
                                                'priority',
                                                value === 'all' ? '' : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Priorities" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Priorities
                                            </SelectItem>
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
                                </div>

                                {/* Division Filter (only for Admin/HR) */}
                                {canManage && (
                                    <div className="space-y-2">
                                        <Label>Division</Label>
                                        <Select
                                            value={filterData.division || 'all'}
                                            onValueChange={(value) =>
                                                handleFilterChange(
                                                    'division',
                                                    value === 'all'
                                                        ? ''
                                                        : value,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Divisions" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Divisions
                                                </SelectItem>
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
                                    </div>
                                )}

                                {/* Assigned To Filter (only for Admin/HR) */}
                                {canManage && (
                                    <div className="space-y-2">
                                        <Label>Assigned To</Label>
                                        <Select
                                            value={
                                                filterData.assigned_to || 'all'
                                            }
                                            onValueChange={(value) =>
                                                handleFilterChange(
                                                    'assigned_to',
                                                    value === 'all'
                                                        ? ''
                                                        : value,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Employees" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Employees
                                                </SelectItem>
                                                {employees.map((emp) => (
                                                    <SelectItem
                                                        key={emp.id}
                                                        value={emp.id.toString()}
                                                    >
                                                        {emp.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Deadline From */}
                                <div className="space-y-2">
                                    <Label>Deadline From</Label>
                                    <Input
                                        type="date"
                                        value={filterData.deadline_from}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                'deadline_from',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                {/* Deadline To */}
                                <div className="space-y-2">
                                    <Label>Deadline To</Label>
                                    <Input
                                        type="date"
                                        value={filterData.deadline_to}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                'deadline_to',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                {/* Sort By */}
                                <div className="space-y-2">
                                    <Label>Sort By</Label>
                                    <Select
                                        value={filterData.sort_by}
                                        onValueChange={(value) =>
                                            handleFilterChange('sort_by', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="deadline_nearest">
                                                Deadline Terdekat
                                            </SelectItem>
                                            <SelectItem value="priority_highest">
                                                Prioritas Tertinggi
                                            </SelectItem>
                                            <SelectItem value="newest">
                                                Tugas Terbaru
                                            </SelectItem>
                                            <SelectItem value="oldest">
                                                Tugas Terlama
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <Button onClick={applyFilters}>
                                    Apply Filters
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                >
                                    <XIcon className="mr-2 h-4 w-4" />
                                    Clear All
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="rounded-md border px-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Division</TableHead>
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
                                        colSpan={7}
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
                                        <TableCell className="capitalize">
                                            {task.division || 'N/A'}
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
