"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [myCourses, setMyCourses] = useState<any[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { user } = useAuth();

    useEffect(() => {
        loadCourses();
        if (user) loadMyCourses();
    }, [user]);

    const loadCourses = async () => {
        try {
            const res = await api.get("/courses");
            setCourses(res.data || []);
        } catch (err) {
            setError("Không thể tải khóa học");
        }
    };

    const loadMyCourses = async () => {
        try {
            const res = await api.get("/enrollments");
            setMyCourses(res.data || []);
        } catch (err) {
            console.error("Không thể tải khóa học của tôi");
        }
    };

    const handleCreateCourse = async () => {
        if (!title.trim()) {
            setError("Vui lòng nhập tên khóa học");
            return;
        }

        setLoading(true);
        try {
            await api.post("/courses", { title, description });
            setTitle("");
            setDescription("");
            setShowCreateForm(false);
            setError("");
            loadCourses();
        } catch (err: any) {
            setError(err.response?.data?.message || "Lỗi tạo khóa học");
        } finally {
            setLoading(false);
        }
    };

    const handleEnrollCourse = async (courseId: string) => {
        try {
            await api.post("/enrollments", { courseId });
            loadMyCourses();
            loadCourses();
        } catch (err: any) {
            alert(err.response?.data?.message || "Không thể đăng ký khóa học");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-blue-600 text-white p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">Khóa học</h1>
                    <p className="text-blue-100">Khám phá và học tập với PLearn</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto p-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* My Courses Section */}
                {user && myCourses.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold mb-6">📚 Khóa học của bạn</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myCourses.map((enrollment: any) => (
                                <Link key={enrollment.id} href={`/courses/${enrollment.course.id}`}>
                                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-xl">{enrollment.course.title}</h3>
                                            <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                                                {enrollment.progress}%
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-4">{enrollment.course.description}</p>
                                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-green-500 h-full transition-all"
                                                style={{ width: `${enrollment.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Create Course Section */}
                {user && (
                    <div className="mb-12 bg-white p-8 rounded-lg shadow">
                        <h2 className="text-2xl font-bold mb-6">Tạo khóa học mới</h2>

                        {!showCreateForm ? (
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                            >
                                + Tạo khóa học
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Tên khóa học"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg"
                                />
                                <textarea
                                    placeholder="Mô tả khóa học"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg h-24"
                                />
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleCreateCourse}
                                        disabled={loading}
                                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                                    >
                                        {loading ? "Đang tạo..." : "Tạo khóa học"}
                                    </button>
                                    <button
                                        onClick={() => setShowCreateForm(false)}
                                        className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Available Courses */}
                <div>
                    <h2 className="text-3xl font-bold mb-6">🔍 Tất cả khóa học</h2>
                    {courses.length === 0 ? (
                        <p className="text-gray-600">Không có khóa học nào</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course: any) => {
                                const isEnrolled = myCourses.some((e) => e.course.id === course.id);
                                return (
                                    <div key={course.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                                        <h3 className="font-bold text-xl mb-2">{course.title}</h3>
                                        <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                                        <p className="text-sm text-gray-500 mb-4">Giảng viên: <strong>{course.instructor.name}</strong></p>
                                        
                                        <div className="flex gap-2">
                                            <Link href={`/courses/${course.id}`} className="flex-1">
                                                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                                                    Xem chi tiết
                                                </button>
                                            </Link>
                                            {!isEnrolled && user && (
                                                <button
                                                    onClick={() => handleEnrollCourse(course.id)}
                                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                                                >
                                                    Đăng ký
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
