import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuBadge, // Import SidebarMenuBadge
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={page.url.startsWith(
                                resolveUrl(item.href),
                            )}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch className="flex items-center">
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                                {item.notificationCount && item.notificationCount > 0 && (
                                    <SidebarMenuBadge className="ml-auto">
                                        {item.notificationCount}
                                    </SidebarMenuBadge>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
