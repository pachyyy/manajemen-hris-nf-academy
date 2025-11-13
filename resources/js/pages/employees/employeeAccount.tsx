import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Employee, User } from '@/types';
import { usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface PageProps {
    employee: Employee & { user: User | null };
}

export default function EmployeeAccount() {
    const { employee } = usePage<PageProps>().props;
    const [error, setError] = useState<string | null>(null);
    const [displayPassword, setDisplayPassword] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const storedPassword = sessionStorage.getItem('generatedPassword');
        if (storedPassword) {
            setDisplayPassword(storedPassword);
        }
    }, []);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Employees', href: '/dashboard/employees' },
        {
            title: 'Employee Account',
            href: `/dashboard/employees/account/${employee.id}`,
        },
    ];

    const createAccount = async () => {
        try {
            const response = await fetch(
                `/api/employees/${employee.id}/create-account`,
                {
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
                },
            );

            if (!response.ok) {
                throw new Error('Failed to create account');
            }

            const data = await response.json();
            sessionStorage.setItem('generatedPassword', data.password);
            setDisplayPassword(data.password);
            router.reload({ only: ['employee'] });
        } catch (err: any) {
            setError(err.message);
        }
    };

    const deleteAccount = async () => {
        if (!employee.user) return;

        try {
            const response = await fetch(
                `/api/employees/account/${employee.user.id}`,
                {
                    method: 'DELETE',
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
                },
            );

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }
            router.reload({ only: ['employee'] });
        } catch (err: any) {
            setError(err.message);
        }
    };

    const resetPassword = async () => {
        if (!employee.user) return;

        try {
            const response = await fetch(
                `/api/employees/account/${employee.user.id}/reset-password`,
                {
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
                },
            );

            if (!response.ok) {
                throw new Error('Failed to reset password');
            }

            const data = await response.json();
            setDisplayPassword(data.password);
            setShowPassword(true);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">
                    Employee Account Management
                </h1>

                {error && <div className="text-red-500">{error}</div>}

                <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
                    <h2 className="mb-2 text-xl font-semibold">
                        {employee.first_name} {employee.last_name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {employee.email}
                    </p>
                </div>

                {employee.user ? (
                    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
                        <h3 className="mb-4 text-lg font-semibold">
                            Account Details
                        </h3>
                        <p>
                            An account already exists for this employee.
                        </p>
                        <div className="flex space-x-2 mt-4">
                            <Button
                                onClick={resetPassword}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Reset Password
                            </Button>
                            <Button
                                onClick={deleteAccount}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete Account
                            </Button>
                        </div>

                        {displayPassword && (
                            <div className="mt-4">
                                <h4 className="font-semibold">
                                    New Generated Password:
                                </h4>
                                <div className="flex items-center space-x-2">
                                    <p
                                        className={`font-mono ${showPassword ? '' : 'blur-sm'}`}
                                    >
                                        {displayPassword}
                                    </p>
                                    <Button
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        variant="outline"
                                        size="sm"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </Button>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Please save this password.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-neutral-800">
                        <h3 className="mb-4 text-lg font-semibold">
                            Create Account
                        </h3>
                        <p>No account has been made for this employee.</p>
                        <Button
                            onClick={createAccount}
                            className="mt-4"
                        >
                            Create Account
                        </Button>

                        {displayPassword && (
                            <div className="mt-4">
                                <h4 className="font-semibold">
                                    Generated Password:
                                </h4>
                                <div className="flex items-center space-x-2">
                                    <p
                                        className={`font-mono ${showPassword ? '' : 'blur-sm'}`}
                                    >
                                        {displayPassword}
                                    </p>
                                    <Button
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        variant="outline"
                                        size="sm"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </Button>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Please save this password.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
