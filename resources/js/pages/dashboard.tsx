import { usePage } from '@inertiajs/react';
import AdminDashboard from '@/pages/AdminDashboard';
import StaffDashboard from '@/pages/StaffDashboard';
import { PageProps } from '@/types';

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;
    const { user } = auth;

    // Hint: To add more role-based dashboards or custom logic,
    // modify this section to check for different role names.
    // Ensure you have a corresponding component (e.g., GuestDashboard.tsx)
    // and import it at the top.
    if (user && user.role && (user.role.id === 1 || user.role.id === 2)) {
        return <AdminDashboard />;
    } else if (user && user.role && user.role.id === 3) {
        return <StaffDashboard />;
    } else {
        // Fallback for users without a recognized role or if role is not set
        // Hint: You can create a generic dashboard component for other roles or
        // redirect them to a specific page using Inertia.js's visit function.
        return (
            <div className="flex items-center justify-center min-h-screen">
                <h1>Welcome to the Dashboard! Your role is not recognized or set up for a specific view.</h1>
            </div>
        );
    }
}
