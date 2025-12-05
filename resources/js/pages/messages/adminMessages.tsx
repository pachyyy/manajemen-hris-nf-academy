import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface User {
    id: number;
    name: string;
}

export default function AdminMessages() {
    const [users, setUsers] = useState<User[]>([]);
    const { data, setData, post, errors, reset } = useForm({
        user_id: 'all',
        title: '',
        body: '',
    });

    useEffect(() => {
        // Fetch all staff users to populate the dropdown
        const fetchUsers = async () => {
            try {
                // We need an endpoint to get all staff users
                const response = await fetch('/api/employees');
                if (response.ok) {
                    const employees = await response.json();
                    const staffUsers = employees.map((emp: any) => emp.user).filter(Boolean);
                    setUsers(staffUsers);
                }
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };
        fetchUsers();
    }, []);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pesan', href: '/messages' },
        { title: 'Kirim Pesan', href: '/messages' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/api/messages', {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kirim Pesan" />
            <div className="p-2">
                <h1 className="text-2xl font-bold">Kirim Pesan</h1>
                <p className="text-gray-600">
                    Kirim pesan atau notifikasi kepada pegawai.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-4">
                    <div>
                        <Label htmlFor="user_id">Kirim Ke</Label>
                        <Select
                            value={data.user_id}
                            onValueChange={(value) => setData('user_id', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Pegawai" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Staff</SelectItem>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={String(user.id)}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="title">Judul</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            required
                        />
                        {errors.title && (
                            <p className="text-sm text-red-600">{errors.title}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="body">Isi Pesan</Label>
                        <Textarea
                            id="body"
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            required
                        />
                        {errors.body && (
                            <p className="text-sm text-red-600">{errors.body}</p>
                        )}
                    </div>

                    <Button type="submit">Kirim Pesan</Button>
                </form>
            </div>
        </AppLayout>
    );
}
