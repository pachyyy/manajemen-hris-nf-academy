import { usePage } from '@inertiajs/react';
import AdminMessages from '@/pages/messages/adminMessages';
import StaffMessages from '@/pages/messages/staffMessages';
import { PageProps } from '@/types';

export default function Messages() {
    const { auth } = usePage<PageProps>().props;
    const { user } = auth;

    if (user && user.role && (user.role.id === 1 || user.role.id === 2)) {
        return <AdminMessages />;
    } else {
        return <StaffMessages />;
    }
}
