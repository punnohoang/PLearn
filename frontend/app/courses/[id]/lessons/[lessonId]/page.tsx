"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function LessonPage({ params }: { params: { id: string; lessonId: string } }) {
    const [lesson, setLesson] = useState<any>(null);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [allLessons, setAllLessons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const { user } = useAuth();

    useEffect(() => {
        loadLesson();
        loadEnrollment();
        loadAllLessons();
    }, []);

    const loadLesson = async () => {
        try {
            const res = await api.get(`/lessons/detail/${params.lessonId}`);
            setLesson(res.data);
        } catch (err: any) {
            setError("Không thể tải bài học");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadAllLessons = async () => {
        try {
            const res = await api.get(`/lessons/course/${params.id}`);
            setAllLessons(res.data || []);
        } catch (err) {
            console.error("Failed to load lessons:", err);
        }
    };

    const loadEnrollment = async () => {
        try {
            const enrollmentsRes = await api.get("/enrollments");
            const userEnrollment = enrollmentsRes.data.find(
                (e: any) => e.course.id === params.id
            );
            setEnrollment(userEnrollment);
        } catch (err) {
            console.error("Failed to load enrollment:", err);
        }
    };

    const markComplete = async () => {
        if (!enrollment) return;

        setUpdating(true);
        setError("");
        try {
            const newProgress = Math.min(100, enrollment.progress + 10);
            await api.patch(`/enrollments/${enrollment.id}`, {
                progress: newProgress,
            });
            setEnrollment({ ...enrollment, progress: newProgress });
        } catch (err: any) {
            setError(
                err.response?.data?.message || "Không thể cập nhật tiến độ"
            );
            console.error(err);
        } finally {
            setUpdating(false);
        }
    };

    // Get current lesson index
    const currentIndex = allLessons.findIndex(l => l.id === params.lessonId);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    // Check if content is video URL
    const isVideoUrl = lesson?.content?.startsWith('http') &&
        (lesson?.content?.includes('youtube.com') ||
            lesson?.content?.includes('youtu.be') ||
            lesson?.content?.includes('.mp4'));

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-600">
                Đang tải bài học...
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="p-8 text-center text-red-600">
                Không tìm thấy bài học
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb & Back Button */}
            <div className="bg-white border-b border-gray-200 px-8 py-4">
                <div className="max-w-4xl mx-auto">
                    <Link href={`/courses/${params.id}`}>
                        <button className="text-blue-600 hover:text-blue-800 font-semibold mb-2">
                            ← Quay lại khóa học
                        </button>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto p-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Header */}
                <div className="bg-white rounded-lg shadow p-8 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                {lesson.order}. {lesson.title}
                            </h1>
                            <p className="text-gray-600">
                                Thời lượng: {lesson.duration || "N/A"} phút
                            </p>
                        </div>
                        {enrollment && (
                            <div className="text-right">
                                <p className="text-sm text-gray-600 mb-2">
                                    Tiến độ khóa học
                                </p>
                                <p className="text-3xl font-bold text-green-600">
                                    {enrollment.progress}%
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lesson Content */}
                <div className="bg-white rounded-lg shadow p-8 mb-6">
                    <div
                        className="prose prose-lg max-w-none text-gray-800"
                        dangerouslySetInnerHTML={{
                            __html: lesson.content || "<p>Không có nội dung</p>",
                        }}
                    />
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow p-8">
                    <div className="flex justify-between items-center">
                        <Link href={`/courses/${params.id}`}>
                            <button className="text-gray-600 hover:text-gray-800 font-semibold px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                                ← Bài trước
                            </button>
                        </Link>

                        {user && enrollment ? (
                            <button
                                onClick={markComplete}
                                disabled={updating}
                                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-bold"
                            >
                                {updating
                                    ? "Đang cập nhật..."
                                    : "✓ Đã hoàn thành bài học"}
                            </button>
                        ) : (
                            <Link href="/login">
                                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-bold">
                                    Đăng nhập để hoàn thành
                                </button>
                            </Link>
                        )}

                        <Link href={`/courses/${params.id}`}>
                            <button className="text-gray-600 hover:text-gray-800 font-semibold px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                                Bài sau →
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-8 grid grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <p className="text-sm text-gray-600">Bài học số</p>
                        <p className="text-3xl font-bold text-blue-600">
                            {lesson.order}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <p className="text-sm text-gray-600">Thời lượng</p>
                        <p className="text-3xl font-bold text-green-600">
                            {lesson.duration || "-"} phút
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <p className="text-sm text-gray-600">Trạng thái</p>
                        <p className="text-3xl font-bold text-purple-600">
                            {enrollment?.progress >= lesson.order * 10
                                ? "✓ Done"
                                : "In Progress"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}