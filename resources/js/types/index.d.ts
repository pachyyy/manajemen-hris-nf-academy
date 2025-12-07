import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    notificationCount?: number;
}

export interface Role {
    id: number;
    name: string;
    [key: string]: unknown;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key:string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    employee?: Employee;
    role_id?: number;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    birth_date: string;
    division: string;
    position: string;
    status: string;
    join_date: string;
    document_path: string | null;
    user?: User | null;
}

export type PageProps<T = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
};

declare module '@inertiajs/core' {
    interface PageProps {
        auth: {
            user: {
                id: number;
                name: string;
                email: string;
                role?: Role | null;
            };
        };
    }
}
