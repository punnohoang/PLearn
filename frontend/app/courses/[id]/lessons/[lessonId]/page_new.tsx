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
                ⏳ Đang tải bài học...
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="p-8 text-center text-red-600">
                ❌ Không tìm thấy bài học
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
                        ⚠️ {error}
                    </div>
                )}

                {/* Header */}
                <div className="bg-white rounded-lg shadow p-8 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                📖 Bài {lesson.order}: {lesson.title}
                            </h1>
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

                {/* Video Player or Rich Content */}
                {isVideoUrl ? (
                    <div className="bg-black rounded-lg shadow mb-6 overflow-hidden">
                        <div className="aspect-video bg-gray-900 flex items-center justify-center">
                            {lesson.content.includes('youtube.com') || lesson.content.includes('youtu.be') ? (
                                <iframe
                                    width="100%"
                                    height="600"
                                    src={lesson.content.replace('watch?v=', 'embed/')}
                                    title={lesson.title}
                                    allowFullScreen
                                    className="w-full h-full"
                                />
                            ) : (
                                <video
                                    width="100%"
                                    height="600"
                                    controls
                                    className="w-full h-full"
                                >
                                    <source src={lesson.content} type="video/mp4" />
                                    Your browser does not support HTML5 video.
                                </video>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow p-12 mb-6">
                        <div className="text-center">
                            <p className="text-white text-7xl mb-4">📚</p>
                            <p className="text-white text-xl font-semibold">Nội dung bài học được cung cấp dưới dạng văn bản</p>
                        </div>
                    </div>
                )}

                {/* Lesson Content */}
                <div className="bg-white rounded-lg shadow p-8 mb-6">
                    <h2 className="text-2xl font-bold mb-4">📝 Nội dung bài học</h2>
                    <div
                        className="prose prose-lg max-w-none text-gray-800"
                        dangerouslySetInnerHTML={{
                            __html: lesson.content && !isVideoUrl ? lesson.content : "<p className='text-gray-500'>Bài học được cung cấp ở định dạng video. Hãy xem video ở trên để học nội dung chi tiết.</p>",
                        }}
                    />
                </div>

                {/* Action Buttons */}
                {user && enrollment && (
                    <div className="bg-white rounded-lg shadow p-8 mb-6">
                        <button
                            onClick={markComplete}
                            disabled={updating}
                            className="w-full bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-bold text-lg transition"
                        >
                            {updating ? "⏳ Đang cập nhật..." : "✅ Đánh dấu đã hoàn thành"}
                        </button>
                    </div>
                )}

                {!user && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-6">
                        <p className="text-yellow-800">🔒 Vui lòng <Link href="/login" className="font-bold text-yellow-900 hover:underline">đăng nhập</Link> để đánh dấu hoàn thành bài học</p>
                    </div>
                )}

                {/* Lesson Navigation */}
                {allLessons.length > 1 && (
                    <div className="bg-white rounded-lg shadow p-8">
                        <h3 className="text-lg font-bold mb-4">📍 Điều hướng bài học</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {prevLesson ? (
                                <Link href={`/courses/${params.id}/lessons/${prevLesson.id}`}>
                                    <button className="w-full text-left bg-gray-100 hover:bg-gray-200 p-4 rounded-lg transition">
                                        <p className="text-sm text-gray-600">← Bài trước</p>
                                        <p className="font-semibold text-gray-900">{prevLesson.title}</p>
                                    </button>
                                </Link>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg opacity-50">
                                    <p className="text-sm text-gray-600">← Bài trước</p>
                                    <p className="font-semibold text-gray-400">Đây là bài đầu tiên</p>
                                </div>
                            )}

                            {nextLesson ? (
                                <Link href={`/courses/${params.id}/lessons/${nextLesson.id}`}>
                                    <button className="w-full text-right bg-blue-100 hover:bg-blue-200 p-4 rounded-lg transition">
                                        <p className="text-sm text-gray-600">Bài tiếp theo →</p>
                                        <p className="font-semibold text-blue-700">{nextLesson.title}</p>
                                    </button>
                                </Link>
                            ) : (
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Bài tiếp theo →</p>
                                    <p className="font-semibold text-green-700">🎉 Đã hoàn thành khóa học!</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
