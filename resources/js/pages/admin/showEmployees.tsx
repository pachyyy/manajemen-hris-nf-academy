import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Head, Link } from '@inertiajs/react';
import { MoreHorizontalIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

// Helper function to format date as "DD Mon YYYY"
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

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    birth_date: string;
    division: string;
    position: string;
    status: string;
    join_date: string;
}

export default function ShowEmployees() {
    const [error, setError] = useState<string | null>(null); // Add error state
    const [posts, setPosts] = useState<Employee[]>([]); // For storing data
    const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(
        null,
    );
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/employees', {
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error('Failed to fetch employees: ', error);
            setError('Failed to fetch employees. ');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteClick = (id: number) => {
        setEmployeeToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (employeeToDelete === null) return;

        try {
            const response = await fetch(`/api/employees/${employeeToDelete}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            fetchData();
        } catch (err) {
            console.error('Failed to delete employee:', err);
            setError('Failed to delete employee.');
        } finally {
            setIsDeleteModalOpen(false);
            setEmployeeToDelete(null);
        }
    };


    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Employee Management',
            href: '/dashboard/admin/employees',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title='Employee List' />
            <div className="align-center flex p-3">
                <h1 className="text-3xl font-bold">Employee List</h1>
                <div className="absolute right-2 z-10">
                    <Link href={'/dashboard/admin/employees/add'}>
                        <Button className="cursor-pointer">Add Employee</Button>
                    </Link>
                </div>
            </div>

            {error && (
                <div className="mt-4 text-center text-red-500">{error}</div>
            )}

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
            />

            <Table>
                <TableCaption>A list of the employess</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Birth Date</TableHead>
                        <TableHead>Division</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {posts.map((post) => (
                        <TableRow key={post.id}>
                            <TableCell>{post.first_name}</TableCell>
                            <TableCell>{post.last_name}</TableCell>
                            <TableCell>{post.email}</TableCell>
                            <TableCell>{post.phone}</TableCell>
                            <TableCell>{formatDate(post.birth_date)}</TableCell>
                            <TableCell className='capitalize'>
                                {post.division}
                            </TableCell>
                            <TableCell className='capitalize'>
                                {post.position}
                            </TableCell>
                            <TableCell className='capitalize'>
                                {post.status}
                            </TableCell>
                            <TableCell>{formatDate(post.join_date)}</TableCell>
                            <TableCell>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-label="Open menu">
                                            <MoreHorizontalIcon />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-40"
                                        align="end"
                                    >
                                        <DropdownMenuGroup>
                                            <Link
                                                href={`/dashboard/admin/employees/update/${post.id}`}
                                            >
                                                <DropdownMenuItem>
                                                    Update
                                                </DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuItem onSelect={() => {
                                                handleDeleteClick(post.id)
                                            }}>
                                                Delete
                                            </DropdownMenuItem>
                                            {/* Untuk lihat dan buat akun untuk pengguna / karyawan nantinya */}
                                             <Link
                                                href={`/dashboard/admin/employees/account/${post.id}`}
                                            >
                                                <DropdownMenuItem>
                                                    Check Account
                                                </DropdownMenuItem>
                                            </Link>
                                            <Link href={`/dashboard/admin/employees/${post.id}/documents`}>
                                                <DropdownMenuItem>
                                                    See Documents
                                                </DropdownMenuItem>
                                            </Link>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </AppLayout>
    );
}
