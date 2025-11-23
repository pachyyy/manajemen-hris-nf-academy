'use client';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/table';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { MoreHorizontalIcon } from 'lucide-react';
import { Head } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Role {
    id: number;
    name: string;
    description: string;
}

export default function ShowRoles() {
    const [error, setError] = useState<string | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<number | null>(null);

    // State for the new role form
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDescription, setNewRoleDescription] = useState('');
    const [addRoleError, setAddRoleError] = useState<string | null>(null);

    const handleDeleteClick = (id: number) => {
        setRoleToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (roleToDelete === null) return;

        try {
            const response = await fetch(`/api/roles/${roleToDelete}`, {
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
            setRoles(data);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
            setError('Failed to fetch roles.');
        }
    };

    const handleAddRole = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddRoleError(null);

        try {
            const response = await fetch('/api/roles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
                body: JSON.stringify({
                    name: newRoleName,
                    description: newRoleDescription,
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || `HTTP error! status: ${response.status}`,
                );
            }

            fetchData();
            setIsAddModalOpen(false);
            setNewRoleName('');
            setNewRoleDescription('');
        } catch (err: unknown) {
            console.error('Failed to add Role:', err);
            setAddRoleError((err as Error).message || 'Failed to add Role.');
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Role Management',
            href: '/dashboard/roles',
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Role List" />
            <div className="flex items-center justify-between p-3">
                <h1 className="text-3xl font-bold">Role List</h1>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="cursor-pointer">Add Role</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Role</DialogTitle>
                            <DialogDescription>
                                Enter the details for the new role. Click add when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            id="add-role-form"
                            onSubmit={handleAddRole}
                            className="grid gap-4 py-4"
                        >
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={newRoleName}
                                    onChange={(e) =>
                                        setNewRoleName(e.target.value)
                                    }
                                    className="col-span-3"
                                    placeholder="e.g. Admin"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="description"
                                    className="text-right"
                                >
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={newRoleDescription}
                                    onChange={(e) =>
                                        setNewRoleDescription(e.target.value)
                                    }
                                    className="col-span-3"
                                    placeholder="e.g. Controls the entire system"
                                    required
                                />
                            </div>
                            {addRoleError && (
                                <p className="col-span-4 text-center text-red-500">
                                    {addRoleError}
                                </p>
                            )}
                        </form>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsAddModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" form="add-role-form">
                                Add Role
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {error && (
                <div className="mt-4 text-center text-red-500">{error}</div>
            )}

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
                            <TableCell>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            aria-label="Open menu"
                                            variant="ghost"
                                        >
                                            <MoreHorizontalIcon />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-40"
                                        align="end"
                                    >
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem
                                                onSelect={() => {
                                                    handleDeleteClick(role.id);
                                                }}
                                                className="text-red-600"
                                            >
                                                Delete
                                            </DropdownMenuItem>
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
