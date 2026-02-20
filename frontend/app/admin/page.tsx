'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '@/components/Navigation';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    _count?: {
        courses: number;
        enrollments: number;
    };
}

interface Statistics {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    usersByRole: {
        [key: string]: number;
    };
}

export default function AdminPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<{ [key: string]: string }>({});
    const [updatingRole, setUpdatingRole] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');

    // Check if user is ADMIN
    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            router.push('/');
        }
    }, [user, router]);

    // Fetch users and statistics
    useEffect(() => {
        if (user?.role === 'ADMIN') {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersRes, statsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/statistics`),
            ]);

            setUsers(usersRes.data);
            setStatistics(statsRes.data);

            // Initialize selected roles
            const initialRoles: { [key: string]: string } = {};
            usersRes.data.forEach((u: User) => {
                initialRoles[u.id] = u.role;
            });
            setSelectedRole(initialRoles);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load admin data');
            console.error('Error loading admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (selectedRole[userId] === newRole) return;

        try {
            setUpdatingRole(userId);
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/role`,
                { role: newRole }
            );

            // Update users list and selected role
            setUsers(users.map(u => u.id === userId ? response.data : u));
            setSelectedRole({ ...selectedRole, [userId]: newRole });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update user role');
            console.error('Error updating role:', err);
        } finally {
            setUpdatingRole(null);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete user');
            console.error('Error deleting user:', err);
        }
    };

    // Filter users based on search and role filter
    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'ALL' || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const roles = ['STUDENT', 'INSTRUCTOR', 'MANAGER', 'HR', 'ADMIN'];

    if (!user || user.role !== 'ADMIN') {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-24 px-6 py-8 max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">📊 Admin Dashboard</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        {error}
                    </div>
                )}

                {/* Statistics Cards */}
                {statistics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                            <h3 className="text-gray-600 text-sm font-semibold uppercase">Total Users</h3>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{statistics.totalUsers}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                            <h3 className="text-gray-600 text-sm font-semibold uppercase">Total Courses</h3>
                            <p className="text-3xl font-bold text-green-600 mt-2">{statistics.totalCourses}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                            <h3 className="text-gray-600 text-sm font-semibold uppercase">Total Enrollments</h3>
                            <p className="text-3xl font-bold text-purple-600 mt-2">{statistics.totalEnrollments}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                            <h3 className="text-gray-600 text-sm font-semibold uppercase">Users by Role</h3>
                            <div className="mt-2 text-sm space-y-1">
                                {Object.entries(statistics.usersByRole).map(([role, count]) => (
                                    <div key={role} className="flex justify-between">
                                        <span className="text-gray-600">{role}:</span>
                                        <span className="font-semibold text-orange-600">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* User Management Section */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">👥 User Management</h2>

                        {/* Search and Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="ALL">All Roles</option>
                                {roles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>

                        <p className="text-sm text-gray-600">
                            Showing {filteredUsers.length} of {users.length} users
                        </p>
                    </div>

                    {/* Users Table */}
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            Loading user data...
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No users found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Courses</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Enrollments</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">{u.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={selectedRole[u.id] || u.role}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    disabled={updatingRole === u.id}
                                                    className={`px-3 py-1 rounded text-sm font-medium border border-gray-300 ${
                                                        updatingRole === u.id ? 'opacity-50 cursor-not-allowed' : ''
                                                    }`}
                                                    style={{
                                                        backgroundColor: getRoleColor(selectedRole[u.id] || u.role).bg,
                                                        color: getRoleColor(selectedRole[u.id] || u.role).text,
                                                    }}
                                                >
                                                    {roles.map(role => (
                                                        <option key={role} value={role}>{role}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{u._count?.courses || 0}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{u._count?.enrollments || 0}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    disabled={user.id === u.id}
                                                    className={`px-3 py-1 rounded text-sm font-medium ${
                                                        user.id === u.id
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getRoleColor(role: string): { bg: string; text: string } {
    const colors: { [key: string]: { bg: string; text: string } } = {
        ADMIN: { bg: '#fee2e2', text: '#991b1b' },
        MANAGER: { bg: '#fef3c7', text: '#92400e' },
        HR: { bg: '#dbeafe', text: '#1e40af' },
        INSTRUCTOR: { bg: '#dcfce7', text: '#166534' },
        STUDENT: { bg: '#e9d5ff', text: '#5b21b6' },
    };
    return colors[role] || { bg: '#f3f4f6', text: '#374151' };
}
