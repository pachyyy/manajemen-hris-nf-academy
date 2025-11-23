import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ChevronDownIcon, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    };
    return date.toLocaleDateString('en-GB', options); // 'en-GB' for day-month-year order
};

interface AttendaceRecord {
    id: number;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: string;
    employee: {
        first_name: string;
        last_name: string;
        division: string;
    };
}

export default function AdminAttendance() {
    const [records, setRecords] = useState<AttendaceRecord[]>([]);
    const [division, setDivision] = useState('all');
    const [error, setError] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
        from: sevenDaysAgo,
        to: today,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Absensi', href: '/dashboard/attendance/admin' },
    ];

    // Fetch All Records
    const fetchRecords = async () => {
        try {
            const res = await fetch('/api/attendance', {
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content ?? '',
                },
            });
            if (!res.ok) throw new Error('Failed to fetch attendance data');

            const data = await res.json();
            setRecords(data);
        } catch (err) {
            setError('Failed to load attendance.');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    // Handle Delete
    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const res = await fetch(`/api/attendance/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content ?? '',
                },
            });
            if (!res.ok) throw new Error('Failed to delete attendance record');

            fetchRecords();
            setIsDeleteModalOpen(false);
        } catch (err) {
            setError('Failed to delete record.');
            console.error(err);
        }
    };

    const openDeleteModal = (id: number) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const applyFilter = async () => {
        try {
            const params = new URLSearchParams();

            if (dateRange?.from)
                params.append('start_date', dateRange.from.toISOString());
            if (dateRange?.to)
                params.append('end_date', dateRange.to.toISOString());
            if (division && division !== 'all')
                params.append('division', division);

            const res = await fetch(
                `/api/attendance/filter?${params.toString()}`,
                {
                    headers: { Accept: 'application/json' },
                },
            );

            const data = await res.json();
            setRecords(data);
        } catch (err) {
            console.log(err);
            setError('Failed to apply filter');
        }
    };

    // UI
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Attendance Records' />
            <div>
                <h1 className="mb-4 text-2xl font-bold">Attendance Records</h1>

                {/*  Date filter  */}
                <div className="mb-4 flex max-w-2xl gap-4">
                    <div className="flex flex-col justify-end">
                        <Label className="text-sm font-semibold">
                            Filter by Date
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-between font-normal"
                                >
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {formatDate(
                                                    dateRange.from.toDateString(),
                                                )}{' '}
                                                -{' '}
                                                {formatDate(
                                                    dateRange.to.toDateString(),
                                                )}
                                            </>
                                        ) : (
                                            formatDate(
                                                dateRange.from.toDateString(),
                                            )
                                        )
                                    ) : (
                                        'Select date range'
                                    )}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    captionLayout="dropdown"
                                    onSelect={setDateRange}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div>
                        <Label className="text-sm font-semibold">
                            Filter by Division
                        </Label>
                        <Select
                            value={division}
                            onValueChange={(value) => setDivision(value)}
                        >
                            <SelectTrigger
                                className="w-full"
                                name="division"
                                id="division"
                            >
                                <SelectValue placeholder="Select Division" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="marketing">
                                    Marketing
                                </SelectItem>
                                <SelectItem value="operasional">
                                    Operasional
                                </SelectItem>
                                <SelectItem value="riset dan pengembangan">
                                    Riset dan Pengembangan
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end justify-center">
                        <Button
                            onClick={applyFilter}
                        >
                            Apply Filter
                        </Button>
                    </div>
                </div>

                {error && <p className="mb-3 text-red-500">{error}</p>}

                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onCancel={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                />
            </div>
            <Table className="mx-auto w-full p-2">
                <TableCaption>A list of attendance record</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-xs">Employee's Name</TableHead>
                        <TableHead>Division</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.length === 0 ? (
                        <TableRow>
                            <TableCell className="p-4 text-center" colSpan={7}>
                                No attendance records found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        records.map((rec) => (
                            <TableRow key={rec.id} className="border-b">
                                <TableCell className="">
                                    {rec.employee.first_name}{' '}
                                    {rec.employee.last_name}
                                </TableCell>
                                <TableCell className="">
                                    {rec.employee.division}
                                </TableCell>
                                <TableCell className="">
                                    {formatDate(rec.date)}
                                </TableCell>
                                <TableCell className="">
                                    {rec.check_in ?? '-'}
                                </TableCell>
                                <TableCell className="">
                                    {rec.check_out ?? '-'}
                                </TableCell>
                                <TableCell className="capitalize">
                                    {rec.status}
                                </TableCell>
                                <TableCell className="">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => openDeleteModal(rec.id)}
                                    >
                                        <Trash2 /> Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </AppLayout>
    );
}
