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

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    division: string;
    position: string;
    join_date: Date;
    email: string;
    phone: string;
    status: string;
    document_path: string;
}

export default function ShwoEmployees() {
    const [error, setError] = useState<string | null>(null); // Add error state
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
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
            setEmployees(data);
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
            console.error('Failed to delete role:', err);
            setError('Failed to delete role.');
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
            <div className="align-center flex justify-center px-2">
                <h1 className="text-3xl font-bold">Employee List</h1>
                <div className="absolute right-2 z-10">
                    <Link href={'/dashboard/employees/add'}>
                    <Button
                        className="cursor-pointer"
                    >
                        Add Employee
                    </Button></Link>
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

            <Table >
                <TableCaption>A list of the employess</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>Division</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead className="">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map((employee) => (
                        <TableRow key={employee.id}>
                            <TableCell>{employee.first_name}</TableCell>
                            <TableCell>{employee.last_name}</TableCell>
                            <TableCell>{employee.division}</TableCell>
                            <TableCell>{employee.position}</TableCell>
                            <TableCell>{employee.email}</TableCell>
                            <TableCell>{employee.phone}</TableCell>
                            <TableCell>{employee.status}</TableCell>
                            <TableCell>{employee.join_date}</TableCell>
                            <TableCell className="overflow-visible">
                                <div className="relative">
                                    <Button
                                        className="cursor-pointer bg-neutral-900 hover:bg-neutral-700"
                                        onClick={() =>
                                            toggleDropdown(employee.id)
                                        }
                                    >
                                        <Ellipsis className="text-white hover:text-gray-500" />
                                    </Button>
                                    {openDropdownId === employee.id && (
                                        <div className="absolute right-0 z-100 mt-2 w-48 rounded-md bg-neutral-900 shadow-lg">
                                            <Button
                                                className="block w-full cursor-pointer bg-neutral-900 px-4 py-2 text-left text-sm text-white hover:bg-neutral-800"
                                            >
                                                Update
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    handleDeleteClick(
                                                        employee.id,
                                                    )
                                                }
                                                className="block w-full cursor-pointer bg-neutral-900 px-4 py-2 text-left text-sm text-white hover:bg-neutral-800"
                                            >
                                                Delete
                                            </Button>
                                            <Button
                                                className="block w-full cursor-pointer bg-neutral-900 px-4 py-2 text-left text-sm text-white hover:bg-neutral-800"
                                            >
                                                See documents
                                            </Button>
                                            <Button
                                                className="block w-full cursor-pointer bg-neutral-900 px-4 py-2 text-left text-sm text-white hover:bg-neutral-800"
                                            >
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
