'use client';

import React, { useState } from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';

interface AddRoleModalProps {
    onClose: () => void;
    onRoleAdded: () => void;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({ onClose, onRoleAdded }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch('/api/roles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ name, description }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            onRoleAdded();
            onClose();
        } catch (err: unknown) {
            console.error("Failed to add Role:", err);
            setError((err as Error).message || "Failed to add Role.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Role</h3>
                <div className="mt-2">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <Label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</Label>
                            <Input
                                type="text"
                                id="name"
                                placeholder='e.g. Admin'
                                className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <Textarea
                                id="description"
                                rows={3}
                                placeholder='e.g. Mengontrol penuh sistem'
                                className="p-2 text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                onClick={onClose}
                                variant='secondary'
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="px-4 py-2 "
                            >
                                Add Role
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export { AddRoleModal as default };
