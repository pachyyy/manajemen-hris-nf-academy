import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dasbor',
        href: '/dashboard/admin',
    },
];

export const description = 'A bar chart';

const chartConfig = {
    total: {
        label: 'Total',
        color: 'hsl(var(--chart-1))',
    },
} satisfies ChartConfig;

interface AttendanceSummary {
    hadir: number;
    izin: number;
    sakit: number;
    cuti: number;
    alpha: number;
    terlambat: number;
}

interface SummaryResponse {
    today: string;
    summary: AttendanceSummary;
    totalEmployees: number;
    alreadyAbsented: number;
    notYetAbsented: number;
}

interface UnfinishedTask {
    id: number;
    title: string;
    deadline: string;
    assigned_to: {
        id: number;
        name: string;
    };
}

export default function AdminDashboard() {
    const [summaryData, setSummaryData] = useState<SummaryResponse | null>(
        null,
    );
    const [unfinishedTasks, setUnfinishedTasks] = useState<UnfinishedTask[]>(
        [],
    );

    useEffect(() => {
        const fetchSummaryData = async () => {
            try {
                const response = await fetch('/api/attendance/summary');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const d = await response.json();
                setSummaryData(d);
            } catch (error) {
                console.error('Failed to fetch summary!', error);
            }
        };

        const fetchUnfinishedTasks = async () => {
            try {
                const response = await fetch('/api/tasks/unfinished');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const d = await response.json();
                setUnfinishedTasks(d);
            } catch (error) {
                console.error('Failed to fetch tasks!', error);
            }
        };

        fetchSummaryData();
        fetchUnfinishedTasks();
    }, []);

    const chartData = summaryData
        ? [
              { status: 'Hadir', total: summaryData.summary.hadir },
              { status: 'Izin', total: summaryData.summary.izin },
              { status: 'Sakit', total: summaryData.summary.sakit },
              { status: 'Cuti', total: summaryData.summary.cuti },
              { status: 'Alpha', total: summaryData.summary.alpha },
              { status: 'Terlambat', total: summaryData.summary.terlambat },
          ]
        : [];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dasbor Admin" />
            <div className="p-2">
                <h1 className="text-3xl font-bold">Dasbor Admin & HR</h1>
                {/* Add more admin-specific content here */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                {/* Bar Chart Absensi */}
                <div className="w-full h-full">
                    <Card className="h-full">
                        <CardHeader>
                            <Link href={'/attendance/summary'}>
                                <CardTitle className="hover:underline">
                                    Rekap Absensi
                                </CardTitle>
                            </Link>
                            <CardDescription>
                                {summaryData
                                    ? new Date(
                                          summaryData.today,
                                      ).toLocaleDateString('id-ID', {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                      })
                                    : 'Loading...'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig}>
                                <BarChart accessibilityLayer data={chartData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="status"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent hideLabel />
                                        }
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill="var(--color-total)"
                                        radius={8}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2 text-sm">
                            <div className="flex gap-2 leading-none font-medium">
                                <p>Ringkasan Absensi Hari Ini</p>
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                {/* Daftar tugas yang belum selesai */}
                <div className="w-full h-full">
                    <Card className="h-full">
                        <CardHeader>
                            <Link href={'/tasks'}>
                                <CardTitle className="hover:underline">
                                    Daftar Tugas Belum Selesai
                                </CardTitle>
                            </Link>
                            <CardDescription>
                                Tugas yang mendekati deadline
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="max-h-[300px] overflow-y-auto">
                            {unfinishedTasks.length > 0 ? (
                                <ul className="space-y-2">
                                    {unfinishedTasks.map(task => (
                                        <li
                                            key={task.id}
                                            className="p-2 border rounded-md"
                                        >
                                            <p className="font-semibold">
                                                {task.title}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Dikerjakan oleh:{' '}
                                                {task.assigned_to.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Deadline:{' '}
                                                {new Date(
                                                    task.deadline,
                                                ).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
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
        </AppLayout>
    );
}
