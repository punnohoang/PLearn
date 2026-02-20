'use client';

import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
    const { user, logout } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () => {
        logout();
        setShowMenu(false);
        window.location.href = '/';
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                    📚 PLearn
                </Link>

                <div className="flex gap-6 items-center">
                    {user ? (
                        <>
                            <Link href="/courses" className="text-gray-700 hover:text-blue-600 font-semibold transition">
                                📖 Khóa học
                            </Link>
                            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-semibold transition">
                                📊 Dashboard
                            </Link>

                            {/* User Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg transition"
                                >
                                    <span className="text-xl">👤</span>
                                    <span className="font-semibold text-gray-800">{user.name}</span>
                                    <span className={`ml-1 transition transform ${showMenu ? 'rotate-180' : ''}`}>▼</span>
                                </button>

                                {/* Dropdown Menu */}
                                {showMenu && (
                                    <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                                        {/* User Info */}
                                        <div className="border-b border-gray-200 pb-4 mb-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-600">{user.email}</p>
                                                </div>
                                            </div>

                                            {/* User ID */}
                                            <div className="bg-gray-50 p-3 rounded text-sm">
                                                <p className="text-gray-600 text-xs font-semibold">ID NGƯỜI DÙNG</p>
                                                <p className="text-gray-800 font-mono text-xs break-all">{user.id}</p>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="space-y-2">
                                            <Link href="/profile">
                                                <button
                                                    onClick={() => setShowMenu(false)}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition text-gray-700 font-semibold"
                                                >
                                                    ⚙️ Cài đặt hồ sơ
                                                </button>
                                            </Link>
                                            <Link href="/dashboard">
                                                <button
                                                    onClick={() => setShowMenu(false)}
                                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition text-gray-700 font-semibold"
                                                >
                                                    📊 Bảng điều khiển
                                                </button>
                                            </Link>

                                            {/* Admin Dashboard Link - Only for ADMIN role */}
                                            {user.role === 'ADMIN' && (
                                                <Link href="/admin">
                                                    <button
                                                        onClick={() => setShowMenu(false)}
                                                        className="w-full text-left px-4 py-2 hover:bg-yellow-100 rounded transition text-amber-700 font-semibold bg-yellow-50"
                                                    >
                                                        👑 Trang Quản Trị
                                                    </button>
                                                </Link>
                                            )}

                                            {/* Logout Button */}
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 hover:bg-red-100 rounded transition text-red-600 font-semibold border-t border-gray-200 pt-3"
                                            >
                                                🚪 Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-gray-700 hover:text-blue-600 font-semibold transition">
                                Đăng nhập
                            </Link>
                            <Link href="/register" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold transition">
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}