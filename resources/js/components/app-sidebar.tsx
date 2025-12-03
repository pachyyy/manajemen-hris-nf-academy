// import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    evaluasiKerja,
    laporan,
    pelatihan,
} from '@/routes';
import { type NavItem, type PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, ClipboardCheck, ClipboardList, File, IdCard, Mail, ScrollText, UserCog, Users } from 'lucide-react';

import AppLogo from './app-logo';

// --- Navigation Items for Each Role ---

// For 'Admin HR' role
const adminNavItems: NavItem[] = [
    {
        title: 'Employee Management',
        href: '/dashboard/admin/employees',
        icon: Users,
    },
    {
        title: 'Role Management',
        href: '/dashboard/admin/roles',
        icon: UserCog,
    },
    {
        title: 'Tasks',
        href: '/tasks',
        icon: ClipboardList,
    },
    {
        title: 'Evaluasi Kerja',
        href: evaluasiKerja(),
        icon: IdCard,
    },
    {
        title: 'Pelatihan',
        href: pelatihan(),
        icon: BookOpen,
    },
    {
        title: 'Laporan',
        href: laporan(),
        icon: ScrollText,
    },
    {
        title: 'Messages',
        href: '/dashboard/messages',
        icon: Mail,
    },
];

// For a potential 'HR' role (template)
const hrNavItems: NavItem[] = [
    {
        title: 'Employee Management',
        href: '/dashboard/admin/employees',
        icon: Users,
    },
    {
        title: 'Attendance',
        href: '/dashboard/admin/attendance',
        icon: UserRoundPen,
    },
    {
        title: 'Tasks',
        href: '/tasks',
        icon: ClipboardList,
    },
    {
        title: 'Evaluasi Kerja',
        href: evaluasiKerja(),
        icon: IdCard,
    },
    {
        title: 'Pelatihan',
        href: pelatihan(),
        icon: BookOpen,
    },
    {
        title: 'Messages',
        href: '/dashboard/messages',
        icon: Mail,
    },
];

// Function to get the appropriate navigation items based on user role
const getNavItems = (roleName?: string, userID?: number): NavItem[] => {
    switch (roleName) {
        case 'Admin':
            return adminNavItems;
        case 'Human Resource': // Example for a future HR role
            return hrNavItems;
        default:
            const dynamicEmployeeNavItems: NavItem[] = [
                {
                    title: 'Attendance',
                    href: '/dashboard/employee/attendance',
                    icon: UserRoundPen,
                },
                {
                    title: 'Tasks',
                    href: '/tasks',
                    icon: ClipboardList,
                },
                
                {
                    title: 'Pelatihan',
                    href: pelatihan(),
                    icon: BookOpen,
                },
                {
                    title: 'Messages',
                    href: '/dashboard/messages',
                    icon: Mail,
                },
            ];

            if (userID) {
                dynamicEmployeeNavItems.push({
                    title: 'Upload Documents',
                    href: `/dashboard/admin/employees/${userID}/documents`,
                    icon: File,
                });
            }
            return dynamicEmployeeNavItems; // Default for employees and other roles
    }
};

const getLink = (roleName?: string)=> {
    switch (roleName) {
        case 'Admin':
            return '/dashboard/admin';
        case 'Human Resource': // Example for a future HR role
            return '/dashboard/admin';
        default:
            return '/dashboard/employee'; // Default for employees and other roles
    }
};

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const userID = auth.user?.id
    const userRole = auth.user?.role?.name;
    const mainNavItems = getNavItems(userRole, userID);    const iconLink = getLink(userRole);

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={iconLink} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
