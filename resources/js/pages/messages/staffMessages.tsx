import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Message {
    id: number;
    title: string;
    body: string;
    type: string;
    related_id: number | null;
    read_at: string | null;
    created_at: string;
}

export default function StaffMessages() {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch('/api/messages');
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        };

        fetchMessages();
    }, []);

    const handleMarkAsRead = async (id: number) => {
        try {
            await fetch(`/api/messages/${id}/read`, {
                method: 'PUT',
                headers: {
                     'X-CSRF-TOKEN':
                    (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement
                    )?.content || '',
                }
            });
            
            const response = await fetch('/api/messages');
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to mark message as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await fetch(`/api/messages/read-all`, {
                method: 'PUT',
                 headers: {
                     'X-CSRF-TOKEN':
                    (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement
                    )?.content || '',
                }
            });
            
            const response = await fetch('/api/messages');
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to mark all messages as read:', error);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pesan', href: '/messages' },
    ];

    const unreadMessages = messages.filter(m => !m.read_at).length;

    const getLink = (message: Message) => {
        if (message.type === 'task') {
            return `/tasks/${message.related_id}`;
        }
        if (message.type === 'training') {
            // Assuming a route like /trainings/{id} exists
            return `/trainings/${message.related_id}`;
        }
        return '#';
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pesan" />
            <div className="p-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Pesan Masuk</h1>
                    {unreadMessages > 0 && (
                        <Button onClick={handleMarkAllAsRead} variant="outline">
                            Tandai semua telah dibaca
                        </Button>
                    )}
                </div>
                 <p className="text-gray-600">
                    {unreadMessages > 0 ? `Anda memiliki ${unreadMessages} pesan belum dibaca.` : 'Tidak ada pesan baru.'}
                </p>

                <div className="mt-6 space-y-4">
                    {messages.length === 0 ? (
                        <p>Tidak ada pesan.</p>
                    ) : (
                        messages.map(message => (
                             <Card key={message.id} className={cn(!message.read_at && 'border-blue-500')}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                     <CardTitle className="text-lg">{message.title}</CardTitle>
                                     <span className='text-xs text-gray-500'>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
                                </CardHeader>
                                <CardContent>
                                    <p>{message.body}</p>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    {(message.type === 'task' || message.type === 'training') && message.related_id && (
                                        <Link href={getLink(message)}>
                                            <Button variant='default' size='sm'>Lihat Detail</Button>
                                        </Link>
                                    )}
                                    {!message.read_at && (
                                        <Button onClick={() => handleMarkAsRead(message.id)} variant="secondary" size='sm'>
                                            Tandai sudah dibaca
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
