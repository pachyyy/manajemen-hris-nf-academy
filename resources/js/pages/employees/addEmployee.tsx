'use client';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import React, { useState } from 'react';

export default function AddEmployee() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        birth_date: '',
        division: 'admin',
        position: 'direktur',
        status: 'aktif',
        join_date: '',
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch('/api/employees', {
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
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message ||
                        `HTTP error! status: ${response.status}`,
                );
            }

            window.location.href = '/dashboard/employees';
        } catch (err: unknown) {
            console.error('Failed to add Employee:', err);
            setError((err as Error).message || 'Failed to add Employee.');
        }
    };

    const labelClassname = 'text-sm px-1';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Employees', href: '/dashboard/employees' },
        { title: 'Add Employee', href: '/dashboard/employees/add' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
                <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white">
                    Add New Employee
                </h3>
                <div className="mt-2">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="first_name"
                                    className={labelClassname}
                                >
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    placeholder="e.g. John"
                                    onChange={handleChange}
                                    required
                                    className="focus:ring-opacity-50 mt-1 block w-full rounded-md border-gray-300 p-2 text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="last_name"
                                    className={labelClassname}
                                >
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    placeholder="e.g. Doe"
                                    onChange={handleChange}
                                    required
                                    className="focus:ring-opacity-50 mt-1 block w-full rounded-md border-gray-300 p-2 text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                />
                            </div>

                            <div className="col-span-2">
                                <label
                                    htmlFor="email"
                                    className={labelClassname}
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="e.g. johndoe123@gmail.com"
                                    onChange={handleChange}
                                    required
                                    className="focus:ring-opacity-50 mt-1 block w-full rounded-md border-gray-300 p-2 text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="phone"
                                    className={labelClassname}
                                >
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="e.g. 08123456789"
                                    onChange={handleChange}
                                    required
                                    className="focus:ring-opacity-50 mt-1 block w-full rounded-md border-gray-300 p-2 text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="birth_date"
                                    className={labelClassname}
                                >
                                    Birth Date
                                </label>
                                <input
                                    type="date"
                                    name="birth_date"
                                    onChange={handleChange}
                                    required
                                    className="focus:ring-opacity-50 mt-1 block w-full rounded-md border-gray-300 p-2 text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="division"
                                    className={labelClassname}
                                >
                                    Division
                                </label>
                                <select
                                    name="division"
                                    id="division"
                                    className="focus:ring-opacity-50 mt-1 block w-full rounded-md border-gray-300 p-2 text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                    onChange={handleChange}
                                    required
                                    value={formData.division}
                                >
                                    <option value="-">-</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Operasional">
                                        Operasional
                                    </option>
                                    <option value="Riset dan Pengembangan">
                                        Riset dan Pengembangan
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="position"
                                    className={labelClassname}
                                >
                                    Position
                                </label>
                                <select
                                    name="position"
                                    id="position"
                                    className="focus:ring-opacity-50 mt-1 block w-full rounded-md border-gray-300 p-2 text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                    onChange={handleChange}
                                    required
                                    value={formData.position}
                                >
                                    <option value="direktur">Direktur</option>
                                    <option value="manager">Manager</option>
                                    <option value="staff">Staff</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="join_date"
                                    className={labelClassname}
                                >
                                    Join date
                                </label>
                                <input
                                    type="date"
                                    name="join_date"
                                    onChange={handleChange}
                                    required
                                    className="focus:ring-opacity-50 mt-1 block w-full rounded-md border-gray-300 p-2 text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="status"
                                    className={labelClassname}
                                >
                                    Status
                                </label>
                                <select
                                    name="status"
                                    onChange={handleChange}
                                    value={formData.status}
                                    className="focus:ring-opacity-50 mt-1 block w-full rounded-md border-gray-300 p-2 text-black shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200"
                                >
                                    <option value="aktif">Aktif</option>
                                    <option value="cuti">Cuti</option>
                                    <option value=" resign">Resign</option>
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 text-sm text-red-500">
                                {error}
                            </div>
                        )}
                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                onClick={() => window.history.back()}
                                className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                            >
                                Add Employee
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
