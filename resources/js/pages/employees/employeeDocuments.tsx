import AppLayout from "@/layouts/app-layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Doc {
    id: number;
    name: string;
    file_path: string;
}

interface EmployeeDocumentsProps {
    employeeId: number;
}

export default function EmployeeDocuments({ employeeId }: EmployeeDocumentsProps) {
    const [documents, setDocuments] = useState<Doc[]>([]);
    const [name, setName] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const fetchDocs = async () => {
        const res = await fetch(`/api/employees/${employeeId}/documents`, {
            headers: {
                Accept: "application/json",
            }
        });
        const data = await res.json();
        setDocuments(data);
    };

    useEffect(() => {
        const load = async () => {
            await fetchDocs();
        };
        load();
    }, [employeeId]);

    const uploadDocument = async () => {
        if (!file || !name) return;

        const formData = new FormData();
        formData.append("document", file);
        formData.append("name", name);

        await fetch(`/api/employees/${employeeId}/documents`, {
            method: "POST",
            headers: {
                "X-CSRF-TOKEN":
                    (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || "",
            },
            body: formData,
        });

        setName("");
        setFile(null);
        fetchDocs();
    };

    const deleteDocument = async (id: number) => {
        await fetch(`/api/documents/${id}`, {
            method: "DELETE",
            headers: {
                "X-CSRF-TOKEN":
                    (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || "",
            },
        });

        fetchDocs();
    };

    return (
        <AppLayout breadcrumbs={[{ title: "Employee Documents", href: "#" }]}>
            <h1 className="text-2xl font-bold mb-4">Employee Documents</h1>

            <div className="p-4 bg-white dark:bg-neutral-800 rounded shadow mb-6">
                <h2 className="font-semibold mb-2">Upload Document</h2>

                <Label>Document Name</Label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. KTP, CV, KK"
                />

                <Label className="mt-2">File</Label>
                <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />

                <Button onClick={uploadDocument} className="mt-3">
                    Upload
                </Button>
            </div>

            <div className="p-4 bg-white dark:bg-neutral-800 rounded shadow">
                <h2 className="font-semibold mb-2">Uploaded Documents</h2>

                {documents.length === 0 ? (
                    <p>No documents uploaded.</p>
                ) : (
                    <ul className="space-y-2">
                        {documents.map((doc) => (
                            <li
                                key={doc.id}
                                className="flex justify-between items-center border-b pb-2"
                            >
                                <a
                                    href={`/storage/${doc.file_path}`}
                                    target="_blank"
                                    className="text-blue-600 underline"
                                >
                                    {doc.name}
                                </a>

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
