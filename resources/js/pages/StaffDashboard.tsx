import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dasbor Pegawai',
        href: '/dashboard/staff',
    },
];

interface UnfinishedTask {
    id: number;
    title: string;
    deadline: string;
}

export default function StaffDashboard() {
    const [hasAttendedToday, setHasAttendedToday] = useState(false);
    const [staffUnfinishedTasks, setStaffUnfinishedTasks] = useState<
        UnfinishedTask[]
    >([]);

    useEffect(() => {
        const checkAttendance = async () => {
            try {
                const response = await fetch('/api/attendance/today-status');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setHasAttendedToday(data.hasAttended);
            } catch (error) {
                console.error('Failed to check attendance status:', error);
            }
        };

        const fetchStaffUnfinishedTasks = async () => {
            try {
                const response = await fetch('/api/staff/unfinished-tasks');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setStaffUnfinishedTasks(data);
            } catch (error) {
                console.error('Failed to fetch staff unfinished tasks:', error);
            }
        };

        checkAttendance();
        fetchStaffUnfinishedTasks();
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dasbor Pegawai" />
            <div className="p-2">
                <h1 className="text-3xl font-bold">Dasbor Pegawai</h1>
                {/* Add more staff-specific content here */}

                <div className="mt-4 flex flex-col gap-4">
                    {/* Notifikasi dan tombol absensi */}
                    <div className="">
                        <Card>
                            <CardHeader>
                                <CardTitle>Status Absensi Hari Ini</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {hasAttendedToday ? (
                                    <p className="text-green-600">
                                        Anda sudah melakukan absensi hari ini.
                                    </p>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <p>
                                            Anda belum melakukan absensi hari
                                            ini.
                                        </p>
                                        <Link href="/employee-attendance">
                                            <Button>Submit Absensi</Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Daftar tugas yang belum dikerjakan*/}
                    <div className="">
                        <Card>
                            <CardHeader>
                                <Link href={'/tasks'}>
                                    <CardTitle className="hover:underline">
                                        Daftar Tugas Anda
                                    </CardTitle>
                                </Link>
                                <CardDescription>
                                    Tugas yang mendekati deadline
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="max-h-[200px] overflow-y-auto">
                                {staffUnfinishedTasks.length > 0 ? (
                                    <ul className="space-y-2 max-w-md">
                                        {staffUnfinishedTasks.map((task) => (
                                            <li
                                                key={task.id}
                                                className="p-2 border rounded-md"
                                            >
                                                <p className="font-semibold">
                                                    {task.title}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Deadline:{' '}
                                                    {new Date(
                                                        task.deadline,
                                                    ).toLocaleDateString(
                                                        'id-ID',
                                                        {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        },
                                                    )}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>Tidak ada tugas</p>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Link
                                    href={'/tasks'}
                                    className="text-sm text-blue-500 hover:underline"
                                >
                                    Lihat semua tugas
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
