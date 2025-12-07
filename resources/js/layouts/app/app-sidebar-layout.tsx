import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren, useEffect, useState } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        const fetchNotificationCount = async () => {
            try {
                const response = await fetch('/api/messages/unread-count');
                if (!response.ok) {
                    throw new Error(
                        `HTTP error! status: ${response.status}`,
                    );
                }
                const data = await response.json();
                setNotificationCount(data.count);
            } catch (error) {
                console.error('Failed to fetch notification count!', error);
            }
        };

        fetchNotificationCount();
    }, []);
    return (
        <AppShell variant="sidebar">
            <AppSidebar notificationCount={notificationCount} />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
