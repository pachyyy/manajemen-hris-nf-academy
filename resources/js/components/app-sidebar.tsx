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
import { BookOpen, UserRoundPen, ClipboardList, File, IdCard, Mail, ScrollText, UserCog, Users } from 'lucide-react';

import AppLogo from './app-logo';

// --- Navigation Items for Each Role ---

// For 'Admin HR' role
const getAdminNavItems = (notificationCount: number): NavItem[] => [
    {
        title: 'Pegawai',
        href: '/employees',
        icon: Users,
    },
    {
        title: 'Manajemen Peran',
        href: '/roles',
        icon: UserCog,
    },
    {
        title: 'Kehadiran',
        href: '/attendance',
        icon: UserRoundPen,
    },
    {
        title: 'Penugasan',
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
        href: '/laporan/admin',
        icon: ScrollText,
    },
    {
        title: 'Pesan',
        href: '/messages',
        icon: Mail,
        notificationCount,
    },
];

// For a potential 'HR' role (template)
const getHrNavItems = (notificationCount: number): NavItem[] => [
    {
        title: 'Pegawai',
        href: '/employees',
        icon: Users,
    },
    {
        title: 'Kehadiran',
        href: '/attendance',
        icon: UserRoundPen,
    },
    {
        title: 'Penugasan',
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
        href: '/laporan/admin', // Assuming HR also uses the admin view for reports
        icon: ScrollText,
    },
    {
        title: 'Pesan',
        href: '/messages',
        icon: Mail,
        notificationCount,
    },
];

// Function to get the appropriate navigation items based on user role
const getNavItems = (roleName: string | undefined, userID: number | undefined, notificationCount: number): NavItem[] => {
    switch (roleName) {
        case 'Admin':
            return getAdminNavItems(notificationCount);
        case 'Human Resource': // Example for a future HR role
            return getHrNavItems(notificationCount);
        default: {
            const dynamicEmployeeNavItems: NavItem[] = [
                {
                    title: 'Kehadiran',
                    href: '/employee-attendance',
                    icon: UserRoundPen,
                },
                {
                    title: 'Penugasan',
                    href: '/tasks',
                    icon: ClipboardList,
                },
                {
                    title: 'Evaluasi Kerja',
                    href: '/evaluasiKerja',
                    icon: ClipboardList,
                },

                {
                    title: 'Pelatihan',
                    href: pelatihan(),
                    icon: BookOpen,
                },
                {
                    title: 'Laporan',
                    href: '/laporan/staff',
                    icon: ScrollText,
                },
                {
                    title: 'Pesan',
                    href: '/messages',
                    icon: Mail,
                    notificationCount,
                },
            ];

            if (userID) {
                dynamicEmployeeNavItems.push({
                    title: 'Unggah Dokumen',
                    href: `/employee-documents/${userID}`,
                    icon: File,
                });
            }
            return dynamicEmployeeNavItems; // Default for employees and other roles
        }
    }
};

export function AppSidebar({ notificationCount = 0 }: { notificationCount?: number }) {
    const { auth } = usePage<PageProps>().props;
    const userID = auth.user?.id
    const userRole = auth.user?.role?.name;
    const mainNavItems = getNavItems(userRole, userID, notificationCount);

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href='/dashboard' prefetch>
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
