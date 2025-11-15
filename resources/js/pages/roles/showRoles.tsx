'use client';

import AppLayout from '@/layouts/app-layout';
import { Button } from "@/components/ui/button";
import { BreadcrumbItem } from '@/types';
import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AddRoleModal from '@/components/addRoleModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { Ellipsis } from 'lucide-react';

interface Role {
    id: number;
    name: string;
    description: string;
}

export default function ShowRoles() {
    const [error, setError] = useState<string | null>(null); // Add error state
    const [roles, setRoles] = useState<Role[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

    const handleDeleteClick = (id: number) => {
        setRoleToDelete(id);
        setIsDeleteModalOpen(true);
        setOpenDropdownId(null);
    };

    const confirmDelete = async () => {
        if (roleToDelete === null) return;

        try {
            const response = await fetch(`/api/roles/${roleToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            fetchData();
        } catch (err) {
            console.error("Failed to delete role:", err);
            setError("Failed to delete role.");
        } finally {
            setIsDeleteModalOpen(false);
            setRoleToDelete(null);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/roles', {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setRoles(data);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
            setError('Failed to fetch roles.');
        }
    };

    const toggleDropdown = (id: number) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Role Management',
            href: '/dashboard/roles',
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex justify-center align-center p-3">
                <h1 className="text-3xl font-bold">Role List</h1>
                <div className="absolute z-10 right-2 ">
                    <Button className="cursor-pointer" onClick={() => setIsAddModalOpen(true)}>
                        Add Role
                    </Button>
                </div>
                {isAddModalOpen && (
                    <AddRoleModal
                        onClose={() => setIsAddModalOpen(false)}
                        onRoleAdded={() => {
                            fetchData();
                            setIsAddModalOpen(false);
                        }}
                    />
                )}
            </div>

            {error && <div className="text-red-500 text-center mt-4">{error}</div>}

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
            />

            <Table className="w-full p-2">
                <TableCaption>A list of the roles</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-xs">Name</TableHead>
                        <TableHead className="md">Description</TableHead>
                        <TableHead className="">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {roles.map((role) => (
                        <TableRow key={role.id}>
                            <TableCell>{role.name}</TableCell>
                            <TableCell>{role.description}</TableCell>
                            <TableCell className="overflow-visible">
                                <div className="relative">
                                    <Button
                                        onClick={() => toggleDropdown(role.id)}
                                    >
                                        <Ellipsis/>
                                    </Button>
                                    {openDropdownId === role.id && (
                                        <div className="fixed lg:right-7 md:right-4 mt-2 w-24 bg-neutral-900 rounded-md shadow-lg z-50">
                                            <Button
                                                onClick={() =>
                                                    handleDeleteClick(role.id)
                                                }
                                                className="block w-full text-left px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer"
                                            >
                                                Delete
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
