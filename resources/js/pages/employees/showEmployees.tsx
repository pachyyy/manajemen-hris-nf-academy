import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { Button } from '@/components/ui/button';
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
import { Link } from '@inertiajs/react';
import { Ellipsis } from 'lucide-react';
import { useEffect, useState } from 'react';

// Helper function to capitalize the first letter of a string
const capitalizeFirstLetter = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Helper function to format date as "DD Mon YYYY"
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options); // 'en-GB' for day-month-year order
};

// interface Employee {
//     id: number;
//     first_name: string;
//     last_name: string;
//     division: string;
//     position: string;
//     join_date: Date;
//     email: string;
//     phone: string;
//     status: string;
//     document_path: string;
//     role: number;
// }

export default function ShwoEmployees() {
    const [error, setError] = useState<string | null>(null); // Add error state
    const [posts, setPosts] = useState([]); // For storing data
    const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(
        null,
    );
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

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
    });

    const handleDeleteClick = (id: number) => {
        setEmployeeToDelete(id);
        setIsDeleteModalOpen(true);
        setOpenDropdownId(null);
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

    const toggleDropdown = (id: number) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Employee Management',
            href: '/dashboard/employees',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="align-center flex justify-center p-3">
                <h1 className="text-3xl font-bold">Employee List</h1>
                <div className="absolute right-2 z-10">
                    <Link href={'/dashboard/employees/add'}>
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
                        <TableHead className="">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {posts.map((post: any) => (
                        <TableRow key={post.id}>
                            <TableCell>{post.first_name}</TableCell>
                            <TableCell>{post.last_name}</TableCell>
                            <TableCell>{post.email}</TableCell>
                            <TableCell>{post.phone}</TableCell>
                            <TableCell>{formatDate(post.birth_date)}</TableCell>
                            <TableCell>{capitalizeFirstLetter(post.division)}</TableCell>
                            <TableCell>{capitalizeFirstLetter(post.position)}</TableCell>
                            <TableCell>{capitalizeFirstLetter(post.status)}</TableCell>
                            <TableCell>{formatDate(post.join_date)}</TableCell>
                            <TableCell className="overflow-visible">
                                <div className="relative">
                                    <Button
                                        className="cursor-pointer bg-neutral-900 hover:bg-neutral-700"
                                        onClick={() => toggleDropdown(post.id)}
                                    >
                                        <Ellipsis className="text-white hover:text-gray-500" />
                                    </Button>
                                    {openDropdownId === post.id && (
                                        <div className="fixed right-4 z-100 mt-1 w-32 rounded-md bg-neutral-900 shadow-lg">
                                            <Link href={`/dashboard/employees/update/${post.id}`}>
                                                <Button className="block w-full cursor-pointer bg-neutral-900 px-4 py-2 text-left text-sm text-white hover:bg-neutral-800">
                                                    Update
                                                </Button>
                                            </Link>
                                            <Button
                                                onClick={() =>
                                                    handleDeleteClick(post.id)
                                                }
                                                className="block w-full cursor-pointer bg-neutral-900 px-4 py-2 text-left text-sm text-white hover:bg-neutral-800"
                                            >
                                                Delete
                                            </Button>
                                            <Button className="block w-full cursor-pointer bg-neutral-900 px-4 py-2 text-left text-sm text-white hover:bg-neutral-800">
                                                See documents
                                            </Button>
                                            <Button className="block w-full cursor-pointer bg-neutral-900 px-4 py-2 text-left text-sm text-white hover:bg-neutral-800">
                                                {/* Untuk lihat dan buat akun untuk pengguna / karyawan nantinya */}
                                                Check account
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </AppLayout>
    );
}
