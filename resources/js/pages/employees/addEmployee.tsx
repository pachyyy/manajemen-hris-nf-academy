'use client';

import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import React, { useState } from 'react';

export default function AddEmployee(){
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        division: '',
        position: '',
        email: '',
        phone: '',
        status: 'aktif',
        join_date: '',
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const postData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            postData.append(key, value);
        });

        try {
            const response = await fetch('/api/employees', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: postData,
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            window.location.href = '/dashboard/employees';
        } catch (err: unknown) {
            console.error("Failed to add Employee:", err);
            setError((err as Error).message || "Failed to add Employee.");
        }
    };

    const labelClassname = 'text-sm px-1'

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Employees', href: '/dashboard/employees' },
        { title: 'Add Employee', href: '/dashboard/employees/add' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="p-5 border w-full max-w-5xl mx-auto shadow-lg rounded-md bg-white dark:bg-gray-800 ">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Add New Employee</h3>
                <div className="mt-2">
                    <form onSubmit={handleSubmit} className="space-y-4 ">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first_name" className={labelClassname}>First Name</label>
                                <input type="text" name="first_name" placeholder="First Name" onChange={handleChange} required className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                            </div>

                            <div>
                                <label htmlFor="last_name" className={labelClassname}>Last Name</label>
                                <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} required className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                            </div>

                            <div>
                                <label htmlFor="division" className={labelClassname}>Division</label>
                                <input type="text" name="division" placeholder="Division" onChange={handleChange} required className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                            </div>

                            <div>
                                <label htmlFor="position" className={labelClassname}>Position</label>
                                <input type="text" name="position" placeholder="Position" onChange={handleChange} required className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                            </div>

                            <div>
                                <label htmlFor="email" className={labelClassname}>Email</label>
                                <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                            </div>

                            <div>
                                <label htmlFor="phone" className={labelClassname}>Phone Number</label>
                                <input type="tel" name="phone" placeholder="Phone" onChange={handleChange} required className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                            </div>

                            <div>
                                <label htmlFor="status" className={labelClassname}>Status</label>
                                <select name="status" onChange={handleChange} value={formData.status} className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                                <option value="aktif">Aktif</option>
                                <option value="cuti">Cuti</option>
                                <option value="resign">Resign</option>
                            </select>
                            </div>
                            <div>
                                <label htmlFor="join_date" className={labelClassname}>Join date</label>
                            <input type="date" name="join_date" onChange={handleChange} required className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                            </div>
                        </div>

                        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => window.history.back()} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                                Add Employee
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
};
