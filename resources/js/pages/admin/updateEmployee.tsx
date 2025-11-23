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
import { usePage } from '@inertiajs/react';
import { ChevronDownIcon } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    birth_date: Date;
    division: string;
    position: string;
    join_date: Date;
    status: string;
    document_path: string;
}

interface UpdateEmployeeProps {
    id: string;
}

export default function UpdateEmployee() {
    const { id } = usePage().props as UpdateEmployeeProps;
    const [error, setError] = useState<string | null>(null); // Add error state
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        birth_date: '',
        division: '',
        position: '',
        status: '',
        join_date: '',
    });
    const [birthDate, setBirthDate] = React.useState<Date | undefined>(
        undefined,
    );
    const [openBirthDate, setOpenBirthDate] = React.useState(false);
    const [joinDate, setJoinDate] = React.useState<Date | undefined>(undefined);
    const [openJoinDate, setOpenJoinDate] = React.useState(false);
    const [ divisionValue, setDivisionValue ] = useState(formData.division);
    const [ positionValue, setPositionValue ] = useState(formData.position);
    const [ statusValue, setStatusValue ] = useState(formData.status);

    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(`/api/employees/${id}`, {
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
                throw new Error(`Failed to fetch employee data!`);
            }
            const data: Employee = await response.json();
            setFormData({
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone: data.phone,
                birth_date: data.birth_date
                    ? new Date(data.birth_date).toISOString().split('T')[0]
                    : '',
                division: data.division.trim().toLowerCase(),
                position: data.position.trim().toLowerCase(),
                status: data.status.trim().toLowerCase(),
                join_date: data.join_date
                    ? new Date(data.join_date).toISOString().split('T')[0]
                    : '',
            });
            if (data.birth_date) {
                setBirthDate(new Date(data.birth_date));
            }
            if (data.join_date) {
                setJoinDate(new Date(data.join_date));
            }
        } catch (error) {
            console.error('Failed to fetch employees: ', error);
            setError('Failed to fetch employees. ');
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch(`/api/employees/${id}`, {
                method: 'PUT',
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
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 422) {
                    // Handle validation errors
                    console.error('Validation errors:', errorData.errors);
                    setError(
                        'Validation failed: ' +
                            Object.values(errorData.errors).flat().join(' '),
                    );
                } else {
                    throw new Error(
                        errorData.message || 'Failed to update employee.',
                    );
                }
                return;
            }

            // On success, maybe redirect or show a success message
            window.location.href = '/dashboard/employees';
        } catch (err) {
            console.error('Failed to update employee:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        }
    };

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

    useEffect(() => {
        setDivisionValue(formData.division);
        setPositionValue(formData.position);
        setStatusValue(formData.status);
        fetchData();
    }, [id, fetchData, formData]);

    const labelClassname = 'text-sm px-1';
    const divClassname = 'flex flex-col gap-2';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Employees', href: '/dashboard/employees' },
        { title: 'Update Employee', href: '/dashboard/employees/update' },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
                <div>
                    <h1 className="text-2xl font-bold">Update Employee</h1>
                </div>
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
                                value={formData.first_name}
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
                                value={formData.last_name}
                            />
                        </div>

                        <div className="flex flex-col gap-2 col-span-2">
                            <Label htmlFor="email" className={labelClassname}>
                                Email
                            </Label>
                            <Input
                                type="email"
                                name="email"
                                placeholder="e.g. johndoe123@gmail.com"
                                onChange={handleChange}
                                required
                                value={formData.email}
                            />
                        </div>

                        <div className={divClassname}>
                            <Label htmlFor="phone" className={labelClassname}>
                                Phone Number
                            </Label>
                            <Input
                                type="tel"
                                name="phone"
                                placeholder="e.g. 08123456789"
                                onChange={handleChange}
                                required
                                value={formData.phone}
                            />
                        </div>

                        <div className={divClassname}>
                            <Label
                                htmlFor="birth_date"
                                className={labelClassname}
                            >
                                Birth Date
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

                        <div className={divClassname}>
                            <Label
                                htmlFor="division"
                                className={labelClassname}
                            >
                                Division
                            </Label>
                            <Select
                                onValueChange={(value) => {
                                    setDivisionValue(value);
                                }}
                                value={divisionValue}
                                required
                            >
                                <SelectTrigger
                                    id="division">
                                    <SelectValue placeholder="Select Division" />
                                </SelectTrigger>
                                <SelectContent
                                >
                                    <SelectItem value="-">-</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
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

                        <div className={divClassname}>
                            <Label
                                htmlFor="position"
                                className={labelClassname}
                            >
                                Position
                            </Label>
                            <Select
                                onValueChange={(value)=>{
                                    setPositionValue(value);
                                }}
                                value={positionValue}
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
                                    <SelectItem value="staff">Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className={divClassname}>
                            <Label
                                htmlFor="join_date"
                                className={labelClassname}
                            >
                                Join date
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
                            <Label htmlFor="status" className={labelClassname}>
                                Status
                            </Label>
                            <Select
                                onValueChange={(value)=>{
                                    setStatusValue(value);
                                }}
                                value={statusValue}
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
                                    <SelectItem value="aktif">Aktif</SelectItem>
                                    <SelectItem value="cuti">Cuti</SelectItem>
                                    <SelectItem value="resign">
                                        Resign
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 text-sm text-red-500">{error}</div>
                    )}

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            onClick={() => window.history.back()}
                            className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Update Employee</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
