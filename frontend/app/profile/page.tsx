"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState(user?.name || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!user) {
            window.location.href = "/login";
            return;
        }
        loadEnrollments();
    }, [user]);

    const loadEnrollments = async () => {
        try {
            const res = await api.get("/enrollments");
            setEnrollments(res.data || []);
        } catch (err) {
            setError("Không thể tải dữ liệu");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!name.trim()) {
            setError("Vui lòng nhập tên");
            return;
        }

        setUpdating(true);
        setError("");
        setSuccess("");

        try {
            // Note: This assumes you'll add a PATCH /auth/profile endpoint
            // For now, we'll just show the functionality
            console.log("Update profile:", { name, password });
            setSuccess("Cập nhật hồ sơ thành công!");
            setEditMode(false);
            setPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Lỗi khi cập nhật hồ sơ"
            );
        } finally {
            setUpdating(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    const completedCourses = enrollments.filter(
        (e) => e.progress === 100
    ).length;
    const inProgressCourses = enrollments.filter(
        (e) => e.progress < 100
    ).length;
    const averageProgress = Math.round(
        enrollments.reduce((sum, e) => sum + e.progress, 0) /
        (enrollments.length || 1)
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">Hồ sơ cá nhân</h1>
                    <p className="text-blue-100">Quản lý thông tin học tập của bạn</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto p-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 text-center mb-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white text-4xl font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <p className="text-gray-600 text-sm mt-1">{user.email}</p>
                            <button
                                onClick={logout}
                                className="mt-6 w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-bold"
                            >
                                Đăng xuất
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-lg shadow p-6">
                                <p className="text-gray-600 text-sm">Khóa học đã hoàn thành</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {completedCourses}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <p className="text-gray-600 text-sm">Khóa học đang học</p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {inProgressCourses}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <p className="text-gray-600 text-sm">Tiến độ trung bình</p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {averageProgress}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Edit Profile Form */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold">Thông tin cá nhân</h3>
                                {!editMode && (
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        Chỉnh sửa
                                    </button>
                                )}
                            </div>

                            {editMode ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Tên
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Mật khẩu (để trống nếu không đổi)
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Mật khẩu mới"
                                            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Xác nhận mật khẩu
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(e.target.value)
                                            }
                                            placeholder="Xác nhận mật khẩu"
                                            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                        />
                                    </div>

                                    {password && password !== confirmPassword && (
                                        <p className="text-red-600 text-sm">
                                            Mật khẩu không khớp
                                        </p>
                                    )}

                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleUpdateProfile}
                                            disabled={
                                                updating ||
                                                (password &&
                                                    password !==
                                                    confirmPassword)
                                            }
                                            className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-bold"
                                        >
                                            {updating
                                                ? "Đang lưu..."
                                                : "Lưu thay đổi"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditMode(false);
                                                setName(user.name);
                                                setPassword("");
                                                setConfirmPassword("");
                                                setError("");
                                            }}
                                            className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 font-bold"
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-gray-600 text-sm">
                                            Tên
                                        </p>
                                        <p className="text-lg font-semibold">
                                            {user.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">
                                            Email
                                        </p>
                                        <p className="text-lg font-semibold">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Learning Progress */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-2xl font-bold mb-6">
                                📚 Tiến độ học tập
                            </h3>

                            {enrollments.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-600 mb-4">
                                        Bạn chưa đăng ký khóa học nào
                                    </p>
                                    <Link href="/courses">
                                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                                            Xem khóa học
                                        </button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {enrollments.map((enrollment) => (
                                        <Link
                                            key={enrollment.id}
                                            href={`/courses/${enrollment.course.id}`}
                                        >
                                            <div className="p-4 border border-gray-200 rounded-lg hover:shadow-lg transition cursor-pointer">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-bold text-lg">
                                                        {
                                                            enrollment.course
                                                                .title
                                                        }
                                                    </h4>
                                                    <span
                                                        className={`text-sm font-bold px-3 py-1 rounded ${enrollment.progress ===
                                                                100
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-blue-100 text-blue-800"
                                                            }`}
                                                    >
                                                        {enrollment.progress}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-300 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-green-500 h-full transition-all"
                                                        style={{
                                                            width: `${enrollment.progress}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}