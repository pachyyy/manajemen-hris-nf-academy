import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Doc {
    id: number;
    name: string;
    file_path: string;
}

interface Employee {
    bank_account_number?: string;
}

interface EmployeeDocumentsProps {
    employeeId: number;
}

export default function EmployeeDocuments({
    employeeId,
}: EmployeeDocumentsProps) {
    const [documents, setDocuments] = useState<Doc[]>([]);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [name, setName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [bankDetails, setBankDetails] = useState({
        bank_account_number: '',
    });

    const fetchDocs = async () => {
        const res = await fetch(`/api/employees/${employeeId}/documents`, {
            headers: {
                Accept: 'application/json',
            },
        });
        const data = await res.json();
        setDocuments(data);
    };

    const fetchEmployee = async () => {
        const res = await fetch(`/api/employees/${employeeId}`, {
            headers: {
                Accept: 'application/json',
            },
        });
        const data = await res.json();
        setEmployee(data);
        setBankDetails({
            bank_account_number: data.bank_account_number || '',
        });
    };

    useEffect(() => {
        const load = async () => {
            await fetchDocs();
            await fetchEmployee();
        };
        load();
    }, [employeeId]);

    const uploadDocument = async () => {
        if (!file || !name) return;

        const formData = new FormData();
        formData.append('document', file);
        formData.append('name', name);

        await fetch(`/api/employees/${employeeId}/documents`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN':
                    (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement
                    )?.content || '',
            },
            body: formData,
        });

        setName('');
        setFile(null);
        await fetchDocs();
    };

    const deleteDocument = async (id: number) => {
        await fetch(`/api/documents/${id}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN':
                    (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement
                    )?.content || '',
            },
        });

        await fetchDocs();
    };

    const updateBankAccount = async () => {
        await fetch(`/api/employees/${employeeId}/bank-account`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN':
                    (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement
                    )?.content || '',
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ bank_account_number: bankDetails.bank_account_number }),
        });
        alert('Bank details updated!');
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Employees', href: '/dashboard/employees' },
        { title: 'Employee Documents', href: '/dashboard/employees/documents' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <h1 className="mb-4 text-2xl font-bold">
                Employee Documents & Bank Details
            </h1>

            {employee?.bank_account_number ? (
                <div className="mb-6 rounded bg-white p-4 shadow dark:bg-neutral-800">
                    <h2 className="mb-2 font-semibold">Bank Central Asia (BCA)</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Current Account Number: {employee.bank_account_number}
                    </p>
                    <Label className="mt-2">New Bank Account Number</Label>
                    <Input
                        value={bankDetails.bank_account_number}
                        onChange={(e) =>
                            setBankDetails({
                                bank_account_number: e.target.value,
                            })
                        }
                        placeholder="e.g. 1234567890"
                        className="max-w-xs"
                    />
                    <Button onClick={updateBankAccount} className="mt-3">
                        Update Bank Details
                    </Button>
                </div>
            ) : (
                <div className="mb-6 rounded bg-white p-4 shadow dark:bg-neutral-800">
                    <h2 className="mb-2 font-semibold">Add Bank Account (BCA)</h2>
                    <Label className="mt-2">Bank Account Number</Label>
                    <Input
                        value={bankDetails.bank_account_number}
                        onChange={(e) =>
                            setBankDetails({
                                bank_account_number: e.target.value,
                            })
                        }
                        placeholder="e.g. 1234567890"
                        className="max-w-xs"
                    />
                    <Button onClick={updateBankAccount} className="mt-3">
                        Save Bank Details
                    </Button>
                </div>
            )}

            <div className="mb-6 rounded bg-white p-4 shadow dark:bg-neutral-800">
                <h2 className="mb-2 font-semibold">Upload Document</h2>

                <div className="max-w-xs">
                    <Label>Document Name</Label>
                    <Select
                        onValueChange={(value) => {
                            setName(value);
                        }}
                        value={name}
                        required
                    >
                        <SelectTrigger id="document">
                            <SelectValue placeholder="Select Document" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ktp">
                                Kartu Tanda Penduduk (KTP)
                            </SelectItem>
                            <SelectItem value="kk">Kartu Keluarga</SelectItem>
                            <SelectItem value="ijazah">Bukti Pendidikan Terakhir</SelectItem>
                        </SelectContent>
                    </Select>

                    <Label className="mt-2">Upload File</Label>
                    <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />

                    <Button onClick={uploadDocument} className="mt-3">
                        Upload
                    </Button>
                </div>
            </div>

            <div className="rounded bg-white p-4 shadow dark:bg-neutral-800">
                <h2 className="mb-2 font-semibold">Uploaded Documents</h2>

                {documents.length === 0 ? (
                    <p>No documents uploaded.</p>
                ) : (
                    <ul className="space-y-2">
                        {documents.map((doc) => (
                            <li
                                key={doc.id}
                                className="flex items-center justify-between border-b pb-2"
                            >
                                <Link
                                    href={`/storage/${doc.file_path}`}
                                    target="_blank"
                                    className="text-blue-600 underline uppercase"
                                >
                                    {doc.name}
                                </Link>

                                <Button
                                    variant="destructive"
                                    onClick={() => deleteDocument(doc.id)}
                                >
                                    Delete
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AppLayout>
    );
}
