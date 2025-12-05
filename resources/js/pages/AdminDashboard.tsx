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
        title: 'Admin Dashboard',
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
}

interface SummaryResponse {
    today: string;
    summary: AttendanceSummary;
    totalEmployees: number;
    alreadyAbsented: number;
    notYetAbsented: number;
}

export default function AdminDashboard() {
    const [summaryData, setSummaryData] = useState<SummaryResponse | null>(
        null,
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/attendance/summary');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const d = await response.json();
                setSummaryData(d);
            } catch (error) {
                console.error('Failed to fetch!', error);
            }
        };

        fetchData();
    }, []);

    const chartData = summaryData
        ? [
              { status: 'Hadir', total: summaryData.summary.hadir },
              { status: 'Izin', total: summaryData.summary.izin },
              { status: 'Sakit', total: summaryData.summary.sakit },
              { status: 'Cuti', total: summaryData.summary.cuti },
              { status: 'Alpha', total: summaryData.summary.alpha },
          ]
        : [];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dasbor Admin" />
            <div className="p-2">
                <h1 className="text-3xl font-bold">Dasbor Admin</h1>
                {/* Add more admin-specific content here */}
            </div>

            {/* Bar Chart Absensi */}
            <div className="max-w-xl p-2">
                <Card>
                    <CardHeader>
                        <Link href={'/attendance/summary'}>
                            <CardTitle className='hover:underline'>Rekap Absensi</CardTitle>
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
                                    content={<ChartTooltipContent hideLabel />}
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
            <div>

            </div>
        </AppLayout>
    );
}
