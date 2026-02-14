'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Navigation() {
    const { user } = useAuth();

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-blue-600">
                    PLearn
                </Link>

                <div className="flex gap-6 items-center">
                    {user ? (
                        <>
                            <Link href="/courses" className="text-gray-700 hover:text-blue-600 font-semibold">
                                Khóa học
                            </Link>
                            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-semibold">
                                Dashboard
                            </Link>
                            <Link href="/profile" className="text-gray-700 hover:text-blue-600 font-semibold">
                                👤 {user.name}
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-gray-700 hover:text-blue-600 font-semibold">
                                Đăng nhập
                            </Link>
                            <Link href="/register" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}