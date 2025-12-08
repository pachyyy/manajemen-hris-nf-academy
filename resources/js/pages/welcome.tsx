import { login } from '@/routes';
import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                <div className="flex flex-col items-center text-center">
                    <img
                        src="/nf-logo.png"
                        alt="Logo"
                        className="mx-auto mb-8 h-40 w-40"
                    />
                    <p className="mb-8 max-w-md text-lg text-[#706f6c] dark:text-[#A1A09A]">
                        An integrated solution for Human Resource management, all
                        in one place.
                    </p>
                    <Link
                        href={login()}
                        className="inline-block rounded-md bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        Log in
                    </Link>
                </div>
            </div>
        </>
    );
}
