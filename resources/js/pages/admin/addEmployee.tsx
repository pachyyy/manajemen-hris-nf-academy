 'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { ChevronDownIcon } from 'lucide-react';
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
    const [birthDate, setBirthDate] = React.useState<Date | undefined>(
        undefined,
    );
    const [openBirthDate, setOpenBirthDate] = React.useState(false);
    const [joinDate, setJoinDate] = React.useState<Date | undefined>(
        undefined,
    );
    const [openJoinDate, setOpenJoinDate] = React.useState(false);

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
    const divClassname = 'flex flex-col gap-2';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Employees', href: '/dashboard/employees' },
        { title: 'Add Employee', href: '/dashboard/employees/add' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
                <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white">
                    Add New Employee
                </h3>
                <div className="mt-2">
                    <form onSubmit={handleSubmit} className="space-y-4 w-2xl">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className={divClassname}>
                                <Label
                                    htmlFor="first_name"
                                    className={labelClassname}
                                >
                                    First Name
                                </Label>
                                <Input
                                    type="text"
                                    name="first_name"
                                    placeholder="e.g. John"
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={divClassname}>
                                <Label
                                    htmlFor="last_name"
                                    className={labelClassname}
                                >
                                    Last Name
                                </Label>
                                <Input
                                    type="text"
                                    name="last_name"
                                    placeholder="e.g. Doe"
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="col-span-2 flex flex-col gap-2">
                                <Label
                                    htmlFor="email"
                                    className={labelClassname}
                                >
                                    Email
                                </Label>
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="e.g. johndoe123@gmail.com"
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={divClassname}>
                                <Label
                                    htmlFor="phone"
                                    className={labelClassname}
                                >
                                    Phone Number
                                </Label>
                                <Input
                                    type="text"
                                    name="phone"
                                    placeholder="e.g. 08123456789"
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={divClassname}>
                                <Label
                                    htmlFor="birth_date"
                                    className={labelClassname}
                                >
                                    Date of birth
                                </Label>
                                <Popover
                                    open={openBirthDate}
                                    onOpenChange={setOpenBirthDate}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="birth_date"
                                            className="w-full justify-between font-normal"
                                        >
                                            {birthDate
                                                ? birthDate.toLocaleDateString(
                                                      'en-CA',
                                                  )
                                                : 'Select date'}
                                            <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto overflow-hidden p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={birthDate}
                                            captionLayout="dropdown"
                                            onSelect={(selectedDate) => {
                                                setBirthDate(selectedDate);
                                                setOpenBirthDate(false);
                                                setFormData((prevState) => ({
                                                    ...prevState,
                                                    birth_date: selectedDate
                                                        ? selectedDate.toLocaleDateString(
                                                              'en-CA',
                                                          )
                                                        : '',
                                                }));
                                            }}
                                            required
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div>
                                <Label
                                    htmlFor="division"
                                    className={labelClassname}
                                >
                                    Division
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormData((prevState) => ({
                                            ...prevState,
                                            division: value,
                                        }))
                                    }
                                    required
                                >
                                <SelectTrigger
                                        id="division"
                                        value={formData.division}
                                    >
                                        <SelectValue placeholder="Select Division" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="-">
                                            -
                                        </SelectItem>
                                        <SelectItem value="admin">
                                            Admin
                                        </SelectItem>
                                        <SelectItem value="marketing">
                                            Marketing
                                        </SelectItem>
                                        <SelectItem value="operasional">
                                            Operasional
                                        </SelectItem>
                                        <SelectItem value="riset dan pengembangan">
                                            Riset dan Pengembangan
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label
                                    htmlFor="position"
                                    className={labelClassname}
                                >
                                    Position
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormData((prevState) => ({
                                            ...prevState,
                                            position: value,
                                        }))
                                    }
                                    required
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        name="position"
                                        id="position"
                                        value={formData.position}
                                    >
                                        <SelectValue placeholder="Select Position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="direktur">
                                            Direktur
                                        </SelectItem>
                                        <SelectItem value="manager">
                                            Manager
                                        </SelectItem>
                                        <SelectItem value="staff">
                                            Staff
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className={divClassname}>
                                <Label
                                    htmlFor="join_date"
                                    className={labelClassname}
                                >
                                    Join Date
                                </Label>
                                <Popover
                                    open={openJoinDate}
                                    onOpenChange={setOpenJoinDate}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="date"
                                            className="w-full justify-between font-normal"
                                        >
                                            {joinDate
                                                ? joinDate.toLocaleDateString(
                                                      'en-CA',
                                                  )
                                                : 'Select date'}
                                            <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto overflow-hidden p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={joinDate}
                                            captionLayout="dropdown"
                                            onSelect={(selectedDate) => {
                                                setJoinDate(selectedDate);
                                                setOpenJoinDate(false);
                                                setFormData((prevState) => ({
                                                    ...prevState,
                                                    join_date: selectedDate
                                                        ? selectedDate.toLocaleDateString(
                                                              'en-CA',
                                                          )
                                                        : '',
                                                }));
                                            }}
                                            required
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className={divClassname}>
                                <Label
                                    htmlFor="status"
                                    className={labelClassname}
                                >
                                    Status
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setFormData((prevState) => ({
                                            ...prevState,
                                            status: value,
                                        }))
                                    }
                                    required
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        name="status"
                                        id="status"
                                        value={formData.status}
                                    >
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="aktif">
                                            Aktif
                                        </SelectItem>
                                        <SelectItem value="cuti">
                                            Cuti
                                        </SelectItem>
                                        <SelectItem value="Resign">
                                            Resign
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
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
                                variant='secondary'
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
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
