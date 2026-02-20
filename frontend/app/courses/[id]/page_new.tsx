"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function CourseDetailPage() {
    const params = useParams();
    const courseId = params.id as string;
    const [course, setCourse] = useState<any>(null);
    const [enrolled, setEnrolled] = useState(false);
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        loadCourse();
        if (user) checkEnrollment();
    }, [courseId, user]);

    const loadCourse = async () => {
        try {
            const res = await api.get(`/courses/${courseId}`);
            setCourse(res.data);
        } catch (err) {
            console.error("Không thể tải khóa học");
        } finally {
            setLoading(false);
        }
    };

    const checkEnrollment = async () => {
        try {
            const enrollments = await api.get("/enrollments");
            const enrollment = enrollments.data.find((e: any) => e.course.id === courseId);
            if (enrollment) {
                setEnrolled(true);
                setProgress(enrollment.progress);
            }
        } catch (err) {
            console.error("Lỗi kiểm tra đăng ký");
        }
    };

    const handleEnroll = async () => {
        setEnrolling(true);
        try {
            await api.post("/enrollments", { courseId });
            setEnrolled(true);
            setProgress(0);
        } catch (err: any) {
            alert(err.response?.data?.message || "Không thể đăng ký");
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-600">⏳ Đang tải khóa học...</div>;
    if (!course) return <div className="p-8 text-center text-red-600">❌ Không tìm thấy khóa học</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                <div className="max-w-6xl mx-auto">
                    <Link href="/courses" className="text-blue-100 hover:text-white mb-4 inline-block font-semibold">
                        ← Quay lại danh sách khóa học
                    </Link>
                    <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                    <p className="text-blue-100 text-lg">👨‍🏫 Giảng viên: {course.instructor.name}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Main Content */}
                    <div className="lg:col-span-2">
                        {/* Course Thumbnail & Info */}
                        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                            {/* Thumbnail */}
                            <div className="w-full h-96 bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-9xl">📚</span>
                            </div>

                            {/* Course Info */}
                            <div className="p-8">
                                <h2 className="text-2xl font-bold mb-4">📝 Mô tả khóa học</h2>
                                <p className="text-gray-700 leading-relaxed text-lg">{course.description}</p>

                                {/* Course Stats */}
                                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-200">
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-blue-600">{course._count?.lessons || 0}</p>
                                        <p className="text-gray-600 text-sm">📚 Bài học</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-green-600">{course._count?.enrollments || 0}</p>
                                        <p className="text-gray-600 text-sm">👥 Học viên</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-yellow-600">⭐ 4.5</p>
                                        <p className="text-gray-600 text-sm">Đánh giá</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lessons List */}
                        {course.lessons && course.lessons.length > 0 && (
                            <div className="bg-white rounded-lg shadow p-8">
                                <h2 className="text-2xl font-bold mb-6">📖 Danh sách bài học</h2>
                                <div className="space-y-3">
                                    {course.lessons.map((lesson: any, idx: number) => (
                                        <div
                                            key={lesson.id}
                                            className="border border-gray-200 p-4 rounded-lg hover:border-blue-400 hover:shadow-md transition"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">
                                                        Bài {lesson.order}: {lesson.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        📺 Nội dung: {lesson.content?.substring(0, 50) || "Bài học video"}...
                                                    </p>
                                                </div>
                                                {enrolled ? (
                                                    <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                                                        <button className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold">
                                                            Học bài →
                                                        </button>
                                                    </Link>
                                                ) : (
                                                    <span className="ml-4 text-gray-400 text-sm">🔒 Đăng ký để mở</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Enrollment Card */}
                    <div>
                        <div className="bg-white rounded-lg shadow p-8 sticky top-8">
                            {enrolled ? (
                                <>
                                    <div className="mb-6">
                                        <p className="text-sm text-gray-600 mb-2">✅ BẠN ĐÃ ĐĂNG KÝ KHÓA HỌC NÀY</p>
                                        <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4">
                                            <p className="text-green-700 font-bold">Tiến độ học tập: {progress}%</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-6">
                                        <p className="text-sm text-gray-600 mb-2">📈 BIỂU ĐỒ TIẾN ĐỘ</p>
                                        <div className="w-full bg-gray-300 h-4 rounded-full overflow-hidden">
                                            <div
                                                className="bg-green-500 h-full transition-all"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">{progress} / 100% hoàn thành</p>
                                    </div>

                                    <Link href={`/courses/${courseId}/lessons/${course.lessons?.[0]?.id}`}>
                                        <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-bold mb-3">
                                            Tiếp tục học bài →
                                        </button>
                                    </Link>

                                    <Link href="/dashboard">
                                        <button className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold">
                                            Xem Dashboard
                                        </button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-bold mb-4">Bắt đầu khóa học</h3>
                                    <p className="text-gray-600 mb-6">
                                        Đăng ký khóa học này để truy cập tất cả {course._count?.lessons || 0} bài học.
                                    </p>

                                    {user ? (
                                        <>
                                            <button
                                                onClick={handleEnroll}
                                                disabled={enrolling}
                                                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-bold mb-3 transition"
                                            >
                                                {enrolling ? "⏳ Đang đăng ký..." : "✓ Đăng ký khóa học"}
                                            </button>
                                            <p className="text-xs text-gray-500 text-center">Miễn phí • Không thời hạn</p>
                                        </>
                                    ) : (
                                        <>
                                            <Link href="/login">
                                                <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-bold mb-3">
                                                    Đăng nhập để đăng ký
                                                </button>
                                            </Link>
                                            <Link href="/register">
                                                <button className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold">
                                                    Tạo tài khoản mới
                                                </button>
                                            </Link>
                                        </>
                                    )}
                                </>
                            )}

                            {/* Course Meta Info */}
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <p className="text-sm font-semibold text-gray-600 mb-3">ℹ️ THÔNG TIN KHÓA HỌC</p>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>📅 Bắt đầu: 1 tháng trước</p>
                                    <p>⏱️ Thời lượng: ~{(course._count?.lessons || 0) * 30} phút</p>
                                    <p>🎯 Trình độ: Tất cả</p>
                                    <p>💾 Chứng chỉ: Có</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
